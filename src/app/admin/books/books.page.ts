import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminBooks, Book } from '../services/admin-books';
import {Subject, Subscription} from 'rxjs';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {CreateEditComponent} from "./components/create-edit/create-edit.component";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  private searchSubject = new Subject<string>();
  private refreshSub!: Subscription;
  private searchSub!: Subscription;
  constructor(
    private bookService: AdminBooks,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.loadBooks();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm = value;
      this.loadBooks();
    });

    this.refreshSub = this.bookService.refresh$.subscribe(() => {
      this.loadBooks();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
    if (this.searchSub) this.searchSub.unsubscribe();
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

  triggerFileInput(id: number) {
    document.getElementById('file-input-' + id)?.click();
  }


  async onFileSelected(event: any, bookId: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es muy pesada (máx 2MB)');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Subiendo portada...',
      spinner: 'crescent'
    });
    await loading.present();

    this.bookService.uploadImage(bookId, file).subscribe({
      next: () => {
        loading.dismiss();
        // El refresh$ del servicio hará que loadBooks() se dispare solo
      },
      error: (err) => {
        loading.dismiss();
        console.log(err);
      }
    });
  }


  onSearch(event: any) {
    const value = event.detail.value || '';
    this.searchSubject.next(value);
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
