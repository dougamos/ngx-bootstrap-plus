import { NgModule } from '@angular/core';
import { NgbpTimepickerComponent } from './timepicker/timepicker.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    NgbpTimepickerComponent
  ],
  imports: [
    FormsModule,
  ],
  exports: [
    NgbpTimepickerComponent
  ]
})
export class NgxBootstrapPlusModule { }
