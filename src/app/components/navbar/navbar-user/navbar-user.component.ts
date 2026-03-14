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
import {HttpClient} from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule,FormsModule]
})
export class NavbarUserComponent implements OnInit {
  isMobile$: Observable<boolean>;
  isCollapsed = false;

  cartItems$: Observable<any[]>;
  cartItemsCount$: Observable<number>;

  savedAddresses: any[] = [];
  selectedAddressId: number | null = null;
  showNewAddressForm: boolean = false;

  addressForm = {
    recipient_name: '',
    recipient_phone: '',
    postal_code: '',
    state: '',
    municipality: '',
    locality: '',
    neighborhood: '',
    street: '',
    external_number: '',
    internal_number: '',
    references: '',
    is_default: false
  };
  constructor(
    private modalCtrl: ModalController,
    private auth: Auth,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public menuCtrl: MenuController,
    public cartService: Cart,
    private http: HttpClient
  ) {
    this.isMobile$ = this.breakpointObserver
      .observe(['(max-width: 1023px)'])
      .pipe(map(result => result.matches));
    this.cartItems$ = this.cartService.cart$;
    this.cartItemsCount$ = this.cartService.cart$.pipe(map(items => items.length));
  }

  ngOnInit() {
    this.loadAddresses();
  }
  isOrderReady() {
    if (this.showNewAddressForm) {
      return this.addressForm.recipient_name &&
        this.addressForm.street &&
        this.addressForm.locality &&
        this.addressForm.postal_code;
    }
    return this.selectedAddressId !== null;
  }
  loadAddresses() {
    this.http.get(`${environment.apiUrl}/user/addresses`).subscribe((res: any) => {
      this.savedAddresses = res;
      if (this.savedAddresses.length > 0) {
        const def = this.savedAddresses.find(a => a.is_default);
        this.selectedAddressId = def ? def.id : this.savedAddresses[0].id;
      } else {
        this.showNewAddressForm = true;
      }
    });
  }

  deleteAddress(id: number) {
    this.http.delete(`${environment.apiUrl}/user/addresses/${id}`).subscribe(() => {
      this.loadAddresses();
    });
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
    if (!this.isOrderReady()) return;

    const addressId = this.showNewAddressForm ? null : this.selectedAddressId;
    const addressData = this.showNewAddressForm ? this.addressForm : null;

    this.cartService.checkout(addressId, addressData).subscribe({
      next: async (res) => {
        await this.closeCart();
        this.resetAddressForm();
        window.location.reload();
        this.showAlert('¡Pedido realizado con éxito!', 'success');
        this.loadAddresses();
      },
      error: (err) => {
        this.showAlert(err.error?.message || 'Error al procesar la compra', 'warning');
      }
    });
  }
  resetAddressForm() {
    this.addressForm = {
      recipient_name: '',
      recipient_phone: '',
      postal_code: '',
      state: '',
      municipality: '',
      locality: '',
      neighborhood: '',
      street: '',
      external_number: '',
      internal_number: '',
      references: '',
      is_default: true
    };
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
