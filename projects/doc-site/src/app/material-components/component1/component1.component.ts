/*
 * @Author         : Shang
 * @Date           : 2024-05-15
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-06-13
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { JSONSchema7 } from 'json-schema';
import { XBlockRegister } from '../../../../../x-block/src/public-api';

@XBlockRegister({
  key: 'crx-block-component1',
  name: '测试组件1',
  resizeable: {
    widthResize: true,
    defaultWidth: 250,
  },
  propsSchema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['a'],
    title: '组件1-配置信息',
    description: '组件1-辅助信息',
    properties: {
      a: {
        type: 'string',
        title: '组件入参a',
        default: 'default value',
        widget: {
          formlyConfig: {
            templateOptions: { type: 'color' },
          },
        },
      },
      b: {
        type: 'string',
        title: '组件入参b',
        enum: ['1', '2', '3'],
        default: '1',
      },
    },
  } as JSONSchema7,
})
@Component({
  selector: 'crx-block-component1',
  templateUrl: './component1.component.html',
  styleUrl: './component1.component.scss',
})
export class Component1Component {
  @Input({ required: true }) a = 'default value';
  @Input({ required: true }) b = '1';
}
