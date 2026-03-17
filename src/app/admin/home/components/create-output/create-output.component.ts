import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Output } from 'src/app/admin/services/output';
import { finalize } from 'rxjs';

interface OutputItem {
  book_id: number;
  title: string;
  quantity: number;
}

@Component({
  selector: 'app-create-output',
  templateUrl: './create-output.component.html',
  styleUrls: ['./create-output.component.scss'],
  standalone: false
})
export class CreateOutputComponent implements OnInit {
  reason: string = '';
  destination: string = '';
  notes: string = '';
  items: OutputItem[] = [];

  allBooks: Book[] = [];
  searchResults: Book[] = [];
  isSubmitting = false;

  // Lista de motivos predefinidos
  reasons = [
    'Donación',
    'Merma / Dañado',
    'Ajuste de Inventario',
    'Traslado a Sucursal',
    'Muestra Editorial',
    'Otro'
  ];

  constructor(
    private modalCtrl: ModalController,
    private bookService: AdminBooks,
    private adminService: Output
  ) {}

  ngOnInit() {
    this.bookService.getBooks().subscribe(res => this.allBooks = res.data);
  }

  searchBook(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchResults = text.length > 2
      ? this.allBooks.filter(b => b.title.toLowerCase().includes(text) || b.isbn.includes(text))
      : [];
  }

  addItem(book: Book) {
    if (!this.items.find(i => i.book_id === book.id)) {
      this.items.push({
        book_id: book.id!,
        title: book.title,
        quantity: 1
      });
    }
    this.searchResults = [];
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  submitOrder() {
    if (!this.reason || this.items.length === 0) return;
    this.isSubmitting = true;

    const orderData = {
      reason: this.reason,
      destination: this.destination,
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

  close() {
    this.modalCtrl.dismiss();
  }
}
