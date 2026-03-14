import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminUsers } from 'src/app/admin/services/admin-users';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { User } from 'src/app/interfaces/admin/user.model';
@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss'],
  standalone:false
})
export class CreateEditComponent  implements OnInit {
  @Input() data?: User;

  isEdit = false;
  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['user', [Validators.required]],
    customer_type: ['individual', [Validators.required]],
    tax_id: [''],
    active: [true]
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private userService: AdminUsers,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue(this.data);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;


    const rawData = this.form.getRawValue();


    const payload: any = { ...rawData };

    if (this.isEdit) {

      if (!payload.password) {
        delete payload.password;
      }


      this.userService.updateUser(this.data!.id!, payload as Partial<User>)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (res) => {
            this.showAlert(res.message, 'success');
            this.close(true);
          },
          error: (err) => this.handleError(err)
        });
    } else {
      this.userService.createUser(payload as User)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (res) => {
            this.showAlert(res.message, 'success');
            this.close(true);
          },
          error: (err) => this.handleError(err)
        });
    }
  }

  private handleError(err: any) {
    const message = err.error?.message || 'Error en el servidor';
    this.showAlert(message, 'warning');
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

  close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
