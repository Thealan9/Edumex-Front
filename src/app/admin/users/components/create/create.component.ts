import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminUsers } from 'src/app/admin/services/admin-users';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { User } from 'src/app/interfaces/admin/user.model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: false
})
export class CreateComponent  implements OnInit {

  isSubmitting = false;

  form = this.fb.group({
  name: ['', Validators.required],
  last_name: ['', Validators.required],
  password: ['', [Validators.required, Validators.minLength(8)]],
  active: [true],
  email: ['', [Validators.required, Validators.email]],
  role: ['warehouseman', Validators.required],
});

constructor(
    private fb: FormBuilder,
    private userService: AdminUsers,
    private modalCtrl: ModalController,

  ) {}

loading = false;

ngOnInit() {
  this.loading = false;
}

save() {
  if (this.form.invalid) return;
  if (this.isSubmitting) return;
  this.isSubmitting = true;

  this.loading = true;

  const data = this.form.getRawValue() as Partial<User>;

  this.userService.createUser(data)
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
