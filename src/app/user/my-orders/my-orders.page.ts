import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
  standalone:false
})
export class MyOrdersPage implements OnInit {
  orders: any[] = [];
  selectedOrder: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMyOrders();
  }

  loadMyOrders() {
    this.http.get<any[]>(`${environment.apiUrl}/user/my-orders`).subscribe(res => {
      this.orders = res;
    });
  }

  // Método para el Stepper visual
  getStatusStep(status: string): number {
    const steps: any = { 'paid': 1, 'shipped': 2, 'in_transit': 3, 'delivered': 4 };
    return steps[status] || 1;
  }

  viewDetail(order: any) {
    this.selectedOrder = order;
  }

  closeDetail() {
    this.selectedOrder = null;
  }
  statusLabels: any = {
    'paid': 'Preparando en Bodega',
    'shipped': 'Entregado a Paquetería',
    'in_transit': 'En camino a tu domicilio',
    'delivered': '¡Entregado con éxito!'
  };
}
