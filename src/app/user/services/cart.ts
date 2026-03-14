import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from 'src/app/admin/services/admin-books';
import { tap } from 'rxjs/operators';
export interface CartItem {
  book: Book;
  quantity: number;
  buy_type: 'unit' | 'package';
}
@Injectable({
  providedIn: 'root',
})
export class Cart {
  private items: CartItem[] = [];
  private _cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(book: Book, buy_type: 'unit' | 'package' = 'unit') {
    const exists = this.items.find(i =>
      i.book.id === book.id && i.buy_type === buy_type
    );

    if (exists) {
      exists.quantity += 1;
    } else {
      this.items.push({
        book,
        quantity: 1,
        buy_type
      });
    }

    this._cart.next([...this.items]);
  }

  checkout(addressId: number | null, addressData: any = null): Observable<any> {
    const payload = {
      address_id: addressId,
      address_data: addressData,
      items: this.items.map(i => ({
        id: i.book.id,
        quantity: i.quantity,
        buy_type: i.buy_type
      }))
    };
    return this.http.post(`${environment.apiUrl}/user/orders`, payload).pipe(
      tap(() => this.clearCart())
    );
  }

  clearCart() {
    this.items = [];
    this._cart.next([]);
  }

  get total() {
    return this.items.reduce((acc, item) => {
      const price = item.buy_type === 'package'
        ? (item.book.price_package ?? 0)
        : (item.book.price_unit ?? 0);

      return acc + (price * item.quantity);
    }, 0);
  }
}
