/*
 * @Author         : Claude
 * @Date           : 2024-06-24
 * @Description    : Table component with configurable columns
 */

import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { JSONSchema7 } from 'json-schema';
import { XBlockRegister, X_BLOCK_DATA_SOURCE_KEY } from '../../../../../x-block/src/public-api';

export interface TableColumn {
  header: string;
  field: string;
}

@XBlockRegister({
  key: 'crx-block-table',
  name: '可配置表格',
  thumbnail: './assets/table.png',
  resizeable: {
    widthResize: true,
    defaultWidth: 600,
    heightResize: true,
    defaultHeight: 450,
  },
  propsSchema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['columns', 'data'],
    title: '表格配置',
    description: '配置表格的列和数据',
    properties: {
      columns: {
        type: 'array',
        title: '表格列配置',
        items: {
          type: 'object',
          required: ['header', 'field'],
          properties: {
            header: {
              type: 'string',
              title: '列标题',
            },
            field: {
              type: 'string',
              title: '数据字段名飒飒飒试试',
            },
          },
        },
        default: [
          { header: '列1', field: 'field1' },
          { header: '列2', field: 'field2' },
        ],
      },
    },
  } as JSONSchema7,
})
@Component({
  selector: 'crx-block-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements AfterViewInit {
  @Input() columns: TableColumn[] = [];
  @Input(X_BLOCK_DATA_SOURCE_KEY) dataSource: any[] = [];
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  scrollHeight: number = 400;
  data: any[] = [];
  constructor() {}

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit() {
    this.updateScrollHeight();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateScrollHeight();
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  updateScrollHeight() {
    const containerHeight = this.containerRef.nativeElement.offsetHeight;
    const headerHeight = 40;
    this.scrollHeight = containerHeight - headerHeight;
  }
}
