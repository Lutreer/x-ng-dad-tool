/*
 * @Author         : Shang
 * @Date           : 2024-05-22
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-05-22
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import JsonPointer from 'json-pointer';

@Component({
  selector: 'crx-form-object-type',
  templateUrl: './object.type.component.html',
  styleUrls: ['./object.type.component.scss'],
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
export class ObjectTypeComponent extends FieldType implements OnInit {
  override defaultOptions = {
    defaultValue: {},
  };
  isExpand = true;
  constructor() {
    super();
  }
  get descrption() {
    const desc = this.to.description;
    if (!desc) {
      return desc;
    } else {
      if (typeof desc === 'string' || typeof desc === 'number') {
        try {
          return JsonPointer.get(this.model, desc);
        } catch (error) {
          return desc;
        }
      } else if (Array.isArray(desc)) {
        const descParsed = JSON.parse(desc);
        return (descParsed as [])
          .map((el) => {
            try {
              return JsonPointer.get(this.model, el);
            } catch (error) {
              return el;
            }
          })
          .join('');
      } else {
        return desc;
      }
    }
  }

  ngOnInit(): void {}
  toggleExpandAction() {
    this.isExpand = !this.isExpand;
  }
}
