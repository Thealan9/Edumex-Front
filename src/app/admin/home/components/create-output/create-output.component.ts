import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Output } from 'src/app/admin/services/output';
import { finalize } from 'rxjs';
import {AdminUsers} from "../../../services/admin-users";

interface OutputItem {
  book_id: number;
  title: string;
  quantity: number;
  location_id: number;
  location_code: string;
  max_available: number;
}

@Component({
  selector: 'app-create-output',
  templateUrl: './create-output.component.html',
  styleUrls: ['./create-output.component.scss'],
  standalone: false
})
export class CreateOutputComponent implements OnInit {
  warehousemanId: number | null = null;
  warehousemen: any[] = [];

  reason: string = '';
  notes: string = '';
  items: OutputItem[] = [];

  allBooks: Book[] = [];
  searchResults: Book[] = [];
  isSubmitting = false;

  // Lista de motivos predefinidos
  reasons = [
    'Donación',
    'Daño',
    'Ajuste de Inventario',
    'Otro'
  ];

  selectedBook: Book | null = null;
  availableLocations: any[] = [];
  tempQty: number = 1;
  tempLocationId: number | null = null;

  constructor(
    private modalCtrl: ModalController,
    private bookService: AdminBooks,
    private adminService: Output,
    private userService: AdminUsers
  ) {}

  ngOnInit() {
    this.bookService.getBooks().subscribe(res => this.allBooks = res.data);
    this.userService.loadWarehousemen().subscribe(user => this.warehousemen = user);
  }

  searchBook(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchResults = text.length > 2
      ? this.allBooks.filter(b => b.title.toLowerCase().includes(text) || b.isbn.includes(text))
      : [];
  }

  get filteredLocations(): any[] {
    if (!this.selectedBook) return [];
    return this.availableLocations.filter(loc =>
      !this.items.some(item => item.book_id === this.selectedBook?.id && item.location_id === loc.id)
    );
  }

  async addItem(book: Book) {
    this.selectedBook = book;
    this.searchResults = [];
    this.tempLocationId = null;
    this.tempQty = 1;

    this.bookService.getLocationsByBook(book.id!).subscribe(res => {
      this.availableLocations = res.data;
      if(this.availableLocations.length === 0) {
        alert('Este libro no tiene existencias en ninguna ubicación.');
        this.selectedBook = null;
      }
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  submitOrder() {
    if (!this.reason || this.items.length === 0 || !this.warehousemanId){
      alert('Por favor complete todos los campos y asigne un bodeguero.');
      return;
    }
    this.isSubmitting = true;

    const orderData = {
      warehouseman_id: this.warehousemanId,
      reason: this.reason,
      notes: this.notes,
      items: this.items
    };

    this.adminService.createOrder(orderData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => this.modalCtrl.dismiss({ success: true }),
        error: (err) => console.error(err)
      });
  }

  confirmAddLocation() {
    const selectedLocId = Number(this.tempLocationId);
    if (!this.selectedBook || !selectedLocId || this.tempQty <= 0) return;

    const loc = this.availableLocations.find(l => Number(l.id) === selectedLocId);
    if (!loc) return;

    if (this.tempQty > loc.current_stock) {
      alert(`Stock insuficiente en ${loc.code}. Disponible: ${loc.current_stock}`);
      return;
    }

    this.items.push({
      book_id: this.selectedBook.id!,
      title: this.selectedBook.title,
      quantity: this.tempQty,
      location_id: loc.id,
      location_code: loc.code,
      max_available: loc.current_stock
    });

    this.selectedBook = null;
    this.tempLocationId = null;
    this.availableLocations = [];
  }


  close() {
    this.modalCtrl.dismiss();
  }
}
