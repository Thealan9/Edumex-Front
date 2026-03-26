import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { PurchaseOrder } from 'src/app/admin/services/purchase-order';
import { finalize } from 'rxjs';
import {AdminUsers} from "../../../services/admin-users";
interface OrderItem {
  book_id: number;
  title: string;
  quantity: number;
  unit_cost: number;
}
@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
  standalone: false
})
export class CreateOrderComponent  implements OnInit {
  warehousemanId: number | null = null;
  warehousemen: any[] = [];

  supplierName: string = '';
  notes: string = '';
  items: OrderItem[] = [];

  allBooks: Book[] = [];
  searchResults: Book[] = [];
  isSubmitting = false;

  constructor(
    private modalCtrl: ModalController,
    private bookService: AdminBooks,
    private poService: PurchaseOrder,
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

  addItem(book: Book) {
    if (!this.items.find(i => i.book_id === book.id)) {
      this.items.push({
        book_id: book.id!,
        title: book.title,
        quantity: 1,
        unit_cost: 0
      });
    }
    this.searchResults = [];
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  calculateTotal() {
    return this.items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
  }

  submitOrder() {
    if (!this.supplierName || this.items.length === 0 || !this.warehousemanId) {
      alert('Por favor complete todos los campos y asigne un bodeguero.');
      return;
    }
    this.isSubmitting = true;

    const orderData = {
      supplier_name: this.supplierName,
      warehouseman_id: this.warehousemanId,
      notes: this.notes,
      items: this.items
    };

    this.poService.createOrder(orderData)
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
