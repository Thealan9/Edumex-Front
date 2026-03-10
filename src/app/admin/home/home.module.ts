import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertComponent } from 'src/app/components/alert/alert.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ReactiveFormsModule,
    MatSnackBarModule,

  ],
  declarations: [HomePage,AlertComponent]
})
export class HomePageModule {}
