import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminUsers } from 'src/app/admin/services/admin-users';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { User } from 'src/app/interfaces/admin/user.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone:false
})
export class EditComponent  implements OnInit {
  @Input() userId!: number;

  loading = true;
  error: boolean = false;
  isSubmitting = false;

  form = this.fb.group({
    name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', Validators.required],
    //active: [true],
  });

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private adminUsers: AdminUsers,
    private router: Router,
    private modalCtrl: ModalController,

  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    this.adminUsers.getUser(this.userId).subscribe({
      next: user =>{
      this.form.patchValue(user);
      this.loading = false;

      },
      error: err =>{
        console.log("error al cargar el locar",err)
        this.loading = false;
        this.error = !this.error;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = this.form.getRawValue() as Partial<User>;

    this.adminUsers.updateUser(this.userId, data)
    .pipe(finalize(() => this.isSubmitting = false))
    .subscribe({
      next: (res) => {this.close(true),this.showAlert(res.message, 'success')},
      error: (err) => {
        if (err.status === 409 || err.status === 422) {
            this.showAlert(err.error.message, 'warning');
          } else {
            this.showAlert('Oops, ocurrió un error!', 'error');
          }
      },
    });
  }

  async showAlert(
        message: string,
        type: 'success' | 'error' | 'warning'
      ) {
        const modal = await this.modalCtrl.create({
          component: AlertComponent,
          componentProps: { message, type },
          cssClass: 'small-alert-modal',
          backdropDismiss: false,
        });

        await modal.present();
      }
close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }

}
