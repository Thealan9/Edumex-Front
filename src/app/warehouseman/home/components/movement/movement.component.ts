import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { AdminLocation, Location } from 'src/app/admin/services/admin-location';
import { WarehouseInventory } from 'src/app/warehouseman/services/warehouse-inventory';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss'],
  standalone: false
})
export class MovementComponent  implements OnInit {
  @Input() type!: 'input' | 'output';
  @Input() pendingOrderData?: any;

  books: Book[] = [];
  locations: Location[] = [];
  isSubmitting = false;

  distributions: { location_id: number, location_code: string, quantity: number }[] = [];
  form = this.fb.group({
    book_id: [null as number | null, [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    type: [''],
    reference_id: [null as number | null],
    reference_type: [null as string | null],

    temp_location_id: [null as number | null],
    temp_quantity: [1, [Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private adminBooks: AdminBooks,
    private adminLocations: AdminLocation,
    private warehouseService: WarehouseInventory
  ) {}

  ngOnInit() {
    this.form.patchValue({ type: this.type });
    this.loadData();
    this.checkPendingOrder();
  }

  private checkPendingOrder() {
    if (this.pendingOrderData) {
      this.form.patchValue({
        book_id: this.pendingOrderData.book_id,
        temp_quantity: this.pendingOrderData.quantity,
        description: `Ingreso por Orden #${this.pendingOrderData.po_number}`,
        reference_id: this.pendingOrderData.po_id,
        reference_type: 'purchase_order'
      });
      this.form.get('book_id')?.disable();
    }
  }

  // Helper para actualizar el máximo permitido dinámicamente
  private updateQuantityValidator(maxQty: number) {
    this.form.get('quantity')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(maxQty)
    ]);
    this.form.get('quantity')?.updateValueAndValidity();
  }
  get remainingQuantity(): number {
    const target = this.pendingOrderData ? this.pendingOrderData.quantity : 0;
    const currentTotal = this.distributions.reduce((acc, curr) => acc + curr.quantity, 0);
    return target - currentTotal;
  }

  // Agrega un pallet a la lista local
  addDistribution() {
    const locId = this.form.get('temp_location_id')?.value;
    const qty = this.form.get('temp_quantity')?.value;

    if (!locId || !qty || qty <= 0) return;

    const loc = this.locations.find(l => l.id === locId);
    if (!loc) return;

    const available = (loc.max_capacity || 0) - (loc.current_capacity || 0);
    if (qty > available) {
      this.showAlert(`En el pallet ${loc.code} solo caben ${available} unidades.`, 'warning');
      return;
    }

    if (this.pendingOrderData && qty > this.remainingQuantity) {
      this.showAlert(`Solo faltan ${this.remainingQuantity} unidades por ubicar.`, 'warning');
      return;
    }

    this.distributions.push({
      location_id: locId,
      location_code: loc.code,
      quantity: qty
    });

    // --- EL CAMBIO ESTÁ AQUÍ ---
    // Si ya llegamos a cero, reseteamos a 1 para no romper la validación de Validators.min(1)
    this.form.patchValue({
      temp_location_id: null,
      temp_quantity: this.remainingQuantity > 0 ? this.remainingQuantity : 1
    });
  }

  removeDistribution(index: number) {
    this.distributions.splice(index, 1);

    // --- EL CAMBIO ESTÁ AQUÍ ---
    this.form.patchValue({
      temp_quantity: this.remainingQuantity > 0 ? this.remainingQuantity : 1
    });
  }


  loadData() {
    this.adminBooks.getBooks().subscribe({
      next: (res) => this.books = res.data,
      error: (err) => console.error('Error libros:', err)
    });

    // Se recarga para siempre tener la capacidad REAL actualizada
    this.adminLocations.getLocations().subscribe({
      next: (res) => this.locations = res.data,
      error: (err) => console.error('Error cargando ubicaciones:', err)
    });
  }

  submit() {
    if (this.form.invalid || this.distributions.length === 0) return;

    // Si es una orden, obligar a que el total coincida
    if (this.pendingOrderData && this.remainingQuantity !== 0) {
      this.showAlert(`Debes acomodar el total de ${this.pendingOrderData.quantity} unidades antes de confirmar.`, 'warning');
      return;
    }

    this.isSubmitting = true;
    const rawData = this.form.getRawValue();

    // Construimos el objeto final para Laravel
    const payload = {
      book_id: rawData.book_id,
      type: rawData.type,
      description: rawData.description,
      reference_id: rawData.reference_id,
      reference_type: rawData.reference_type,
      distributions: this.distributions // Mandamos el arreglo completo
    };

    this.warehouseService.registerMovement(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.showAlert(res.message, 'success');
          this.close(true);
        },
        error: (err) => this.showAlert(err.error?.message || 'Error', 'warning')
      });
  }



  async showAlert(message: string, type: 'success' | 'error' | 'warning') {
    const modal = await this.modalCtrl.create({
      component: AlertComponent,
      componentProps: { message, type },
      cssClass: 'small-alert-modal'
    });
    await modal.present();
  }

  close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
