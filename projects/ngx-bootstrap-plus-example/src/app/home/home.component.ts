import { Component } from '@angular/core';
import { Time } from 'ngx-bootstrap-plus';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  time: Time = {
    hour: 0,
    minute: 0,
  };
}
