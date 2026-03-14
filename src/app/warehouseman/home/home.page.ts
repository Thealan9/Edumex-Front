import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalController, NavController } from '@ionic/angular';
import { WarehouseInventory, InventoryMovement } from '../services/warehouse-inventory';
import { MovementComponent } from './components/movement/movement.component';
import { Auth } from 'src/app/core/auth';
import {Router} from "@angular/router";
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  recentMovements: any[] = [];
  private refreshSub!: Subscription;

  constructor(
    private warehouseService: WarehouseInventory,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadRecentMovements();

    this.refreshSub = this.warehouseService.refresh$.subscribe(() => {
      this.loadRecentMovements();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  loadRecentMovements() {
    this.warehouseService.getMyMovements().subscribe({
      next: (res) => {
        this.recentMovements = res.data.slice(0, 5);
      },
      error: (err) => console.error('Error cargando movimientos', err)
    });
  }

  async openMovementModal(type: 'input' | 'output') {
    const modal = await this.modalCtrl.create({
      component: MovementComponent,
      componentProps: { type },
      cssClass: 'movement-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadRecentMovements();
    }
  }

  logout() {
    this.auth.logoutApi().subscribe({
      next: async () => {
        await this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async () => {
        await this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }
}
