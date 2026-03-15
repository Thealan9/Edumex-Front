import { Component, inject, OnInit } from '@angular/core';
import { AdminDashboardResponse } from 'src/app/interfaces/admin/admin-dashboard.interface';
import {
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import {CreateOrderComponent} from "./components/create-order/create-order.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{
  stats!: AdminDashboardResponse['stats'];
  activity: AdminDashboardResponse['recent_activity'] = [];

  request: any[] = [];
  solveDetails: any[] = [];
  loadingNotifi = true;

  constructor(
    private modalCtrl: ModalController,
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit() {

  }

  async openCreateOrderModal() {
    const modal = await this.modalCtrl.create({
      component: CreateOrderComponent,
      cssClass: 'create-order-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

  }

  ionViewWillLeave() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  async showAlert(message: string, type: 'success' | 'error' | 'warning') {
    const modal = await this.modalCtrl.create({
      component: AlertComponent,
      componentProps: { message, type },
      cssClass: 'small-alert-modal',
      backdropDismiss: false,
    });

    await modal.present();
  }
}
