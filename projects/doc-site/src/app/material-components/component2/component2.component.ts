/*
 * @Author         : Shang
 * @Date           : 2024-05-15
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-05-27
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { XBlockRegister } from '../../../../../x-block/src/public-api';

@XBlockRegister({
  key: 'crx-block-component2',
  name: '测试组件2',
  resizeable: {
    widthResize: true,
    heightResize: true,
    defaultHeight: 200,
    defaultWidth: 300,
  },
  propsSchema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: '组件2-配置信息',
    description: '组件2-辅助信息',
    properties: {
      b: {
        type: 'string',
        title: '组件入参b',
      },
    },
  },
})
@Component({
  selector: 'crx-block-component2',
  templateUrl: './component2.component.html',
  styleUrl: './component2.component.scss',
})
export class Component2Component {
  @Input() b?: string;
}
