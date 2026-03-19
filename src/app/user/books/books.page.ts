import { Component, OnInit } from '@angular/core';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Cart } from '../services/cart';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {Auth} from "../../core/auth";

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: false
})
export class BooksPage implements OnInit {
  categories = ['General English', 'Grammar & Vocabulary', 'Exam Preparation', 'Business English', 'Readers', 'Teacher Resources'];

  filters = {
    searchText: '',
    category: 'Todos',
    onlyStock: true,
    maxPrice: 2000
  };

  maxPriceLimit = 2000;
  allBooks: Book[] = [];
  books: Book[] = [];
  loading: boolean = false;
  cart$: Observable<any[]>;
  user: any;
  constructor(
    private bookService: AdminBooks,
    private cartService: Cart,
    private toastCtrl: ToastController,
    private auth: Auth,
    private router: Router
  ) {this.cart$ = this.cartService.cart$;}

  ngOnInit() {
    this.loadCatalog();
    this.auth.yo().subscribe(u => this.user = u);
  }
  loadCatalog(event?: any) {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (res) => {
        this.allBooks = res.data;
        this.applyFilters();
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.loading = false;
        if (event) event.target.complete();
        console.error('Error al cargar catálogo', err);
      }
    });
  }

  applyFilters() {
    this.books = this.allBooks.filter(book => {
      const textMatch = book.title.toLowerCase().includes(this.filters.searchText.toLowerCase());

      const categoryMatch = this.filters.category === 'Todos' || book.category === this.filters.category;

      const stockMatch = !this.filters.onlyStock || (book.total_stock! > 0);

      const priceMatch = Number(book.price_unit) <= this.filters.maxPrice;

      return textMatch && categoryMatch && stockMatch && priceMatch;
    });
  }
  resetFilters() {
    this.filters = {
      searchText: '',
      category: 'Todos',
      onlyStock: false,
      maxPrice: this.maxPriceLimit
    };
    this.applyFilters();
  }

  onPriceChange(event: any) {
    this.filters.maxPrice = event.detail.value;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.filters.searchText = event.detail.value || '';
    this.applyFilters();
  }

  async addToCart(book: Book,type: 'unit' | 'package') {
    if (book.total_stock && book.total_stock > 0) {
      this.cartService.addToCart(book, type);

      // const toast = await this.toastCtrl.create({
      //   message: `${book.title} añadido al carrito`,
      //   duration: 1500,
      //   position: 'bottom',
      //   color: 'success',
      //   buttons: [
      //     {
      //       text: 'Ver',
      //       handler: () => {
      //       }
      //     }
      //   ]
      // });
      // await toast.present();
    } else {
      this.presentErrorToast('Lo sentimos, este libro no tiene stock disponible.');
    }
  }

  goToBook(id: number) {
    this.router.navigate(['home/libro', id]);
  }
  async presentErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }

}
