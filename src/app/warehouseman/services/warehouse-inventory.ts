import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, tap } from 'rxjs';

export interface InventoryMovement {
  book_id: number;
  location_id: number;
  type: 'input' | 'output' | 'adjustment' | 'return';
  quantity: number;
  description?: string;
}
@Injectable({
  providedIn: 'root',
})
export class WarehouseInventory {
  private API = `${environment.apiUrl}/warehouseman/inventory`;

  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();

  constructor(private http: HttpClient) {}

  // Registrar Entrada/Salida de libros
  registerMovement(movement: InventoryMovement): Observable<any> {
    return this.http.post(`${this.API}/move`, movement).pipe(
      tap(() => this._refresh.next())
    );
  }

  // Historial de movimientos realizados por este bodeguero
  getMyMovements(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/warehouseman/movements`);
  }
}
