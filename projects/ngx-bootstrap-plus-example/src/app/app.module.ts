import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HomeComponent } from './home/home.component';

import { NgxBootstrapPlusModule } from 'ngx-bootstrap-plus';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    BrowserModule,
    NgxBootstrapPlusModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [HomeComponent]
})
export class AppModule { }
