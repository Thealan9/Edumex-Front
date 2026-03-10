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
  @Input() type!: 'input' | 'output'; // Recibe el tipo desde el home

  books: Book[] = [];
  locations: Location[] = [];
  isSubmitting = false;

  form = this.fb.group({
    book_id: [null, [Validators.required]],
    location_id: [null, [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    description: [''],
    type: [''] // Se asignará en ngOnInit
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
  }

  loadData() {
    this.adminBooks.getBooks().subscribe({
      next: (res) => {
        this.books = res.data;
      },
      error: (err) => console.error('Error libros:', err)
    });

    this.adminLocations.getLocations().subscribe(res => {
      this.locations = res.data;
      console.log('Datos de estantes:', res.data);
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const data = this.form.getRawValue() as any;

    this.warehouseService.registerMovement(data)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.showAlert(res.message, 'success');
          this.close(true);
        },
        error: (err) => {
          // Aquí capturamos el Error 409 de capacidad del estante de Laravel
          this.showAlert(err.error?.message || 'Error en el movimiento', 'warning');
        }
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
