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
    switch(status) {
      case 'paid': return 1;
      case 'shipped': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  }
  statusLabels: any = {
    'paid': 'Preparando en Bodega',
    'shipped': 'Entregado a Paquetería',
    'in_transit': 'En camino a tu domicilio',
    'delivered': '¡Entregado con éxito!'
  };
}
