/*
 * @Author         : Shang
 * @Date           : 2024-05-15
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-05-07
 * @Description    : Customizable card component
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { JSONSchema7 } from 'json-schema';
import { XBlockRegister } from '../../../../../x-block/src/public-api';

@XBlockRegister({
  key: 'crx-block-card',
  name: '自定义卡片',
  thumbnail: `./assets/card.png`,
  resizeable: {
    widthResize: true,
    heightResize: true,
    defaultWidth: 300,
    defaultHeight: 200,
  },
  propsSchema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['headerColor', 'title', 'titleColor', 'titleSize', 'contentBgColor'],
    title: '卡片配置信息',
    description: '可自定义的卡片组件',
    properties: {
      // header 高度为40px
      headerColor: {
        type: 'string',
        title: '头部背景色',
        default: '#222f62',
        widget: {
          formlyConfig: {
            props: { type: 'color' },
          },
        },
      },
      title: {
        type: 'string',
        title: '标题文字',
        default: '卡片标题',
      },
      titleColor: {
        type: 'string',
        title: '标题颜色',
        default: '#ffffff',
        widget: {
          formlyConfig: {
            props: { type: 'color' },
          },
        },
      },
      titleSize: {
        type: 'number',
        title: '标题字号',
        default: 16,
        minimum: 12,
        maximum: 48,
      },
      // 内容区高度为组件高度-40px
      contentBgColor: {
        type: 'string',
        title: '内容区背景色',
        default: '#213585',
        widget: {
          formlyConfig: {
            props: { type: 'color' },
          },
        },
      },
    },
  } as JSONSchema7,
})
@Component({
  selector: 'crx-block-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input({ required: true }) headerColor = '#222f62';
  @Input({ required: true }) title = '卡片标题';
  @Input({ required: true }) titleColor = '#ffffff';
  @Input({ required: true }) titleSize = 16;
  @Input({ required: true }) contentBgColor = '#213585';
}
