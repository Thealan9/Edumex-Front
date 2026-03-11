import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { Auth } from 'src/app/core/auth';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MenuController } from '@ionic/angular';
import { Cart } from 'src/app/user/services/cart';
import {AlertComponent} from "../../alert/alert.component";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule,FormsModule]
})
export class NavbarUserComponent {
  isMobile$: Observable<boolean>;
  isCollapsed = false;

  cartItems$: Observable<any[]>;
  cartItemsCount$: Observable<number>;

  addressForm = {
    recipient_name: '',
    recipient_phone: '',
    postal_code: '',
    state: '',
    municipality: '',
    locality: '', // Podemos usar el mismo valor que neighborhood por ahora
    neighborhood: '',
    street: '',
    external_number: '', // O extraerlo del campo street
    internal_number: '',
    references: '',
    is_default: true
  };
  constructor(
    private modalCtrl: ModalController,
    private auth: Auth,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private menuCtrl: MenuController,
    public cartService: Cart
  ) {
    this.isMobile$ = this.breakpointObserver
      .observe(['(max-width: 1023px)'])
      .pipe(map(result => result.matches));
    this.cartItems$ = this.cartService.cart$;
    this.cartItemsCount$ = this.cartService.cart$.pipe(map(items => items.length));
  }
  async openCart() {
    await this.menuCtrl.enable(true, 'cart-menu');
    await this.menuCtrl.open('cart-menu');
  }

  async closeCart() {
    await this.menuCtrl.close('cart-menu');
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  isFormValid() {
    return this.addressForm.recipient_name &&
      this.addressForm.recipient_phone &&
      this.addressForm.postal_code &&
      this.addressForm.street;
  }

  async checkout() {
    if (!this.isFormValid()) return;
    this.cartService.checkout(this.addressForm).subscribe({
      next: async (res) => {
        await this.closeCart();
        this.showAlert('¡Gracias por tu compra!', 'success');
        // Opcional: Recargar los libros de la página actual para ver el nuevo stock
        window.location.reload();
      },
      error: (err) => {
        this.showAlert(err.error?.message || 'Error al procesar la compra', 'error');
      }
    });
  }

  logout() {
    this.auth.logoutApi().subscribe({
      next: async () => {
        await this.auth.logout();
        this.router.navigateByUrl('/login', {replaceUrl: true});
      },
      error: async () => {
        await this.auth.logout();
        this.router.navigateByUrl('/login', {replaceUrl: true});
      },
    });
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
