import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Location } from '@angular/common';
import {Cart} from "../services/cart";
import {ToastController} from "@ionic/angular";
import {Auth} from "../../core/auth";

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone:false
})
export class BookDetailPage implements OnInit {
  book: any = null;
  isLoading: boolean = true;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private bookService: AdminBooks,
    private location: Location,
    private auth: Auth,
    private cartService: Cart,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => this.user = u);
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBook(Number(bookId));
    }
  }

  loadBook(id: number) {
    this.isLoading = true;
    this.bookService.getBookById(id).subscribe({
      next: (res) => {
        this.book = res.data;
        this.book.total_stock = Number(res.total_stock);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando el libro', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  async addToCart(book: Book,type: 'unit' | 'package') {
    if (book.total_stock && book.total_stock > 0) {
      this.cartService.addToCart(book, type);
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
