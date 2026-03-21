import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface InventoryReportItem {
  isbn: string;
  titulo: string;
  nivel: string;
  stock_inicial: number;
  entradas: number;
  salidas: number;
  stock_final: number;
  alerta: boolean;
}

export interface FinancialReportItem {
  titulo: string;
  isbn: string;
  unidades_sueltas: number;
  paquetes_vendidos: number;
  subtotal: number;
  descuentos: number;
  total_neto: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminReports {
  private API = `${environment.apiUrl}/admin/reports`;

  constructor(private http: HttpClient) {}

  getInventoryReport(month: number, year: number): Observable<{success: boolean, periodo: string, data: InventoryReportItem[]}> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<any>(`${this.API}/inventory`, { params });
  }

  getFinancialReport(month: number, year: number): Observable<{success: boolean, periodo: string, data: FinancialReportItem[], totales: any}> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<any>(`${this.API}/financial`, { params });
  }
}
