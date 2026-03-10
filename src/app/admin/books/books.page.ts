import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminBooks, Book } from '../services/admin-books';
import { Subscription } from 'rxjs';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {CreateEditComponent} from "./components/create-edit/create-edit.component";

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: false
})
export class BooksPage implements OnInit, OnDestroy {
  books: Book[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  private refreshSub!: Subscription;

  constructor(
    private bookService: AdminBooks,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.loadBooks();
    // Suscripción al refresh para recargar cuando se cree/edite un libro
    this.refreshSub = this.bookService.refresh$.subscribe(() => {
      this.loadBooks();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  async loadBooks(event?: any) {
    this.loading = true;
    this.bookService.getBooks(this.searchTerm).subscribe({
      next: (res) => {
        this.books = res.data;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: async (err) => {
        this.loading = false;
        if (event) event.target.complete();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo cargar el catálogo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async openCreateEdit(book?: Book) {
    const modal = await this.modalCtrl.create({
      component: CreateEditComponent,
      componentProps: { data: book },
      cssClass: 'large-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadBooks();
    }
  }


  onSearch(event: any) {
    this.searchTerm = event.detail.value;
    this.loadBooks();
  }

  toggleStatus(book: Book) {
    const newStatus = !book.active;

    this.bookService.updateBook(book.id!, { active: newStatus }).subscribe({
      next: () => {
        book.active = newStatus;
      },
      error: () => {
        this.loadBooks();
      }
    });
  }
}
