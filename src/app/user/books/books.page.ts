import { Component, OnInit } from '@angular/core';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Cart } from '../services/cart';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import {Router} from "@angular/router";
import {Auth} from "../../core/auth";

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: false
})
export class BooksPage implements OnInit {
  categories = ['Todos', 'General English', 'Grammar & Vocabulary', 'Exam Preparation', 'Business English','Readers','Teacher Resources'];
  selectedCategory = 'Todos';
  searchText = '';

  allBooks: Book[] = [];
  books: Book[] = [];
  loading: boolean = false;
  cart$: Observable<any[]>;
  user: any;
  constructor(
    private bookService: AdminBooks,
    private cartService: Cart,
    private toastCtrl: ToastController,
    private auth: Auth
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
        this.applyFilters(); // <--- Centralizamos aquí
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

      // 1. Normalización
      const title = book.title ? book.title.toLowerCase() : '';
      const search = this.searchText ? this.searchText.toLowerCase().trim() : '';

      // 2. Filtro por Categoría (Sigue funcionando con los Chips)
      const categoryMatch = this.selectedCategory === 'Todos' ||
        book.category === this.selectedCategory;

      // 3. Filtro por Texto (AHORA SOLO POR NOMBRE)
      const textMatch = title.includes(search);

      return categoryMatch && textMatch;
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.searchText = event.target.value || '';
    this.applyFilters();
  }

  async addToCart(book: Book,type: 'unit' | 'package') {
    if (book.total_stock && book.total_stock > 0) {
      this.cartService.addToCart(book, type);

      const toast = await this.toastCtrl.create({
        message: `${book.title} añadido al carrito`,
        duration: 1500,
        position: 'bottom',
        color: 'success',
        buttons: [
          {
            text: 'Ver',
            handler: () => {
              // Navegar al carrito si lo deseas
            }
          }
        ]
      });
      await toast.present();
    } else {
      this.presentErrorToast('Lo sentimos, este libro no tiene stock disponible.');
    }
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
