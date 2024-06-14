import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'x-x-block',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <p>
      x-block works! <button mat-button color="primary">Primary</button>
    </p>
  `,
  styles: ``
})
export class XBlockComponent {

}
