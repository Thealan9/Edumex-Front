import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, tap } from 'rxjs';

export interface InventoryMovement {
  id?: number;
  book_id: number;
  location_id: number;
  type: 'input' | 'output' | 'adjustment' | 'return';
  quantity: number;
  description?: string;
  created_at?: string;
  book?: any;
  location?: any;
  user?: any;
}
@Injectable({
  providedIn: 'root',
})
export class WarehouseInventory {
  private API = `${environment.apiUrl}/warehouseman/inventory`;

  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();

  constructor(private http: HttpClient) {}

  registerMovement(movement: any): Observable<any> {
    return this.http.post(`${this.API}/move`, movement).pipe(
      tap(() => this._refresh.next())
    );
  }

  getMyMovements(): Observable<any> {
    return this.http.get(`${this.API}/history`);
  }
}
