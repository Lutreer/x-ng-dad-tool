/*
 * @Author         : Shang
 * @Date           : 2024-05-22
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-05-22
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-array-type',
  templateUrl: './array.type.component.html',
  styleUrls: ['./array.type.component.scss'],
  animations: [
    trigger('toggleExpand', [
      state(
        'expand',
        style({
          // height: 'auto',
        }),
      ),
      state(
        'fold',
        style({
          height: '0px',
          overflow: 'hidden',
        }),
      ),
      transition('expand => fold', [animate('0.3s')]),
      transition('fold => expand', [animate('0.3s')]),
    ]),
  ],
})
export class ArrayTypeComponent extends FieldArrayType implements OnInit {
  constructor() {
    super();
  }
  isExpand = false;
  addCount = 1;

  addByCount() {
    for (let i = 0; i < this.addCount; i++) {
      this.add();
    }
  }
  countChanged() {
    if (this.addCount <= 0) {
      this.addCount = 1;
    } else if (this.addCount > 50) {
      this.addCount = 50;
    } else {
      this.addCount = this.addCount;
    }
  }
  toggleExpandAction() {
    this.isExpand = !this.isExpand;
  }
  ngOnInit() {}

  // ----------------------------------------------------
}
