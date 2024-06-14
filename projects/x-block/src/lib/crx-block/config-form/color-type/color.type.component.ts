import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-color-type',
  templateUrl: './color.type.component.html',
})
export class ColorTypeComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }
  ngOnInit() {}
}
