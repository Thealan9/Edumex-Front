import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersPageRoutingModule } from './users-routing.module';

import { UsersPage } from './users.page';
import { EditComponent } from './components/edit/edit.component';
import { CreateComponent } from './components/create/create.component';
import {CreateEditComponent} from "./components/create-edit/create-edit.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsersPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UsersPage,EditComponent,CreateComponent,CreateEditComponent]
})
export class UsersPageModule {}
