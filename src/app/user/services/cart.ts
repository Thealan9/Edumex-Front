import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from 'src/app/admin/services/admin-books';
import { tap } from 'rxjs/operators';
export interface CartItem {
  book: Book;
  quantity: number;
}
@Injectable({
  providedIn: 'root',
})
export class Cart {
  private items: CartItem[] = [];
  private _cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(book: Book) {
    const exists = this.items.find(i => i.book.id === book.id);
    if (exists) {
      exists.quantity += 1;
    } else {
      this.items.push({ book, quantity: 1 });
    }
    this._cart.next([...this.items]);
  }

  // Método para enviar la orden al servidor
  checkout(): Observable<any> {
    const payload = {
      // Transformamos el carrito al formato que espera la API
      items: this.items.map(i => ({
        id: i.book.id,
        quantity: i.quantity
      }))
    };

    return this.http.post(`${environment.apiUrl}/user/orders`, payload).pipe(
      tap(() => this.clearCart()) // Si sale bien, vaciamos la bolsa
    );
  }

  clearCart() {
    this.items = [];
    this._cart.next([]);
  }

  get total() {
    return this.items.reduce((acc, item) => acc + (item.book.price_unit * item.quantity), 0);
  }
}
