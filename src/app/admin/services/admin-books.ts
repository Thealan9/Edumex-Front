import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, tap } from 'rxjs';
import { Auth } from 'src/app/core/auth';

export interface Book {
  id?: number;
  title: string;
  isbn: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price_unit: number;
  units_per_package: number;
  price_package?: number;
  stock_alert?: number;
  autor: string;
  active: boolean;
  pages: number;
  year: number;
  edition: number;
  format: 'Bolsillo' | 'Tapa Blanda' | 'Tapa Dura';
  size: string;
  supplier: string;
  total_stock?: number;
  image_url?: string;
  image_path?: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminBooks {
  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();
  private get baseUrl() {
    const user = this.auth.currentUserValue;
    const role = user?.role || 'user';

    if (role === 'admin') {
      return `${environment.apiUrl}/admin/books`;
    } else if (role === 'warehouseman') {
      return `${environment.apiUrl}/warehouseman/books`;
    } else {
      return `${environment.apiUrl}/catalog`;
    }
  }

  constructor(private http: HttpClient, private auth: Auth,) {}

  getBooks(search?: string): Observable<{success: boolean, data: Book[]}> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<{success: boolean, data: Book[]}>(this.baseUrl, { params });
  }

  storeBook(book: Book): Observable<any> {
    return this.http.post(this.baseUrl, book).pipe(
      tap(() => this._refresh.next())
    );
  }

  updateBook(id: number, book: Partial<Book>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, book).pipe(
      tap(() => this._refresh.next())
    );
  }

  getBookById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._refresh.next())
    );
  }

  getLocationsByBook(id:number){
    return this.http.get<any>(`${environment.apiUrl}/admin/books-locations/${id}`);
  }
  uploadImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${environment.apiUrl}/admin/books/${id}/image`, formData).pipe(
      tap(() => this._refresh.next())
    );
  }

}
