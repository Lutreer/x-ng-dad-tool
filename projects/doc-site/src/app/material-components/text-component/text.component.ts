/*
 * @Author         : Shang
 * @Date           : 2024-05-15
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-05-07
 * @Description    : Customizable text component
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { JSONSchema7 } from 'json-schema';
import { XBlockRegister } from '../../../../../x-block/src/public-api';

@XBlockRegister({
  key: 'crx-block-text',
  name: '文本组件',
  thumbnail: `./assets/text.png`,
  resizeable: {
    widthResize: true,
    heightResize: true,
    defaultWidth: 300,
    defaultHeight: 80,
  },
  propsSchema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: [
      'content',
      'fontSize',
      'fontColor',
      'fontWeight',
      'isItalic',
      'isLink',
      'backgroundColor',
      'borderColor',
      'borderWidth',
      'borderStyle',
    ],
    title: '文本配置信息',
    description: '可自定义的文本组件',
    properties: {
      content: {
        type: 'string',
        title: '文本内容',
        default: '请输入文本内容',
      },
      horizontalAlign: {
        type: 'string',
        title: '水平对齐',
        enum: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'],
        default: 'flex-start',
      },
      verticalAlign: {
        type: 'string',
        title: '垂直对齐',
        enum: ['flex-start', 'center', 'flex-end', 'stretch'],
        default: 'center',
      },
      fontSize: {
        type: 'number',
        title: '文字大小',
        default: 16,
        minimum: 12,
        maximum: 72,
      },
      fontColor: {
        type: 'string',
        title: '文字颜色',
        default: '#2563EB',
        widget: {
          formlyConfig: {
            props: { type: 'color' },
          },
        },
      },
      fontWeight: {
        type: 'string',
        title: '文字粗细',
        enum: ['normal', 'bold', 'lighter', 'bolder'],
        default: 'normal',
      },
      isItalic: {
        type: 'boolean',
        title: '是否斜体',
        default: false,
      },
      isLink: {
        type: 'boolean',
        title: '是否为链接',
        default: false,
      },
      linkUrl: {
        type: 'string',
        title: '链接地址',
        default: '',
        description: '当设置为链接时，请填写链接地址',
      },
      backgroundColor: {
        type: 'string',
        title: '背景颜色',
        default: 'transparent',
        widget: {
          formlyConfig: {
            props: { type: 'color' },
          },
        },
      },
      borderColor: {
        type: 'string',
        title: '边框颜色',
        default: '#cccccc',
        widget: {
          formlyConfig: {
            props: { type: 'color' },
          },
        },
      },
      borderWidth: {
        type: 'number',
        title: '边框宽度',
        default: 1,
        minimum: 0,
        maximum: 10,
      },
      borderStyle: {
        type: 'string',
        title: '边框样式',
        enum: ['solid', 'dashed', 'dotted', 'double', 'none'],
        default: 'none',
      },
    },
  } as JSONSchema7,
})
@Component({
  selector: 'crx-block-text',
  templateUrl: './text.component.html',
  styleUrl: './text.component.scss',
})
export class TextComponent {
  @Input({ required: true }) content = '请输入文本内容';
  @Input({ required: true }) horizontalAlign = 'flex-start';
  @Input({ required: true }) verticalAlign = 'center';
  @Input({ required: true }) fontSize = 16;
  @Input({ required: true }) fontColor = '#2563EB';
  @Input({ required: true }) fontWeight = 'normal';
  @Input({ required: true }) isItalic = false;
  @Input({ required: true }) isLink = false;
  @Input({ required: true }) linkUrl = '';
  @Input({ required: true }) backgroundColor = 'transparent';
  @Input({ required: true }) borderColor = '#cccccc';
  @Input({ required: true }) borderWidth = 1;
  @Input({ required: true }) borderStyle = 'none';
}
