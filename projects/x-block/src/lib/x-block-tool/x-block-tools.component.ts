import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Injector,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { JSONSchema7 } from 'json-schema';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { BLOCKS_MAP, Resizeable } from '../x-block.decorator';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { KeyValue } from '@angular/common';
import EventSourceUtil from '../utils/EventSource';
import { FetchUtil } from '../utils/FetchUtil';
import { NzMessageService } from 'ng-zorro-antd/message';

type ComponentOptionalName = keyof typeof BLOCKS_MAP;
type Position = { top: number; left: number };
type BlockItem = {
  component: ComponentOptionalName;
  position: Position;
  size: { width: number; height: number };
  layer: number;
  props?: Record<string, any>;
  dataSource?: { type?: 'HTTP' | 'SSE'; url?: string };
};
type InitBlockItem = BlockItem & {
  _tempPosition?: Position;
  _dataResponse?: any;
};
// TODO: EXPORT LAYOUT JSON DATA
type LayoutResult = Record<string, BlockItem>;
type InitLayoutData = Record<string, InitBlockItem>;
type CoModel = {
  top: number;
  left: number;
  dataSource?: { type?: 'HTTP' | 'SSE'; url?: string };
};
export const X_BLOCK_DATA_SOURCE_KEY = '__x_block_data_source__';

@Component({
  selector: 'x-block-tool',
  templateUrl: './x-block-tool.component.html',
  styleUrl: './x-block-tool.component.scss',
})
export class XBlockToolComponent implements OnChanges {
  private sublinePositons: { tops: number[]; lefts: number[] } = { tops: [], lefts: [] };
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeOriginalWidth = 0;
  private resizeOriginalHeight = 0;
  private resizeItemKey: string | null = null;

  @Input({ required: true }) size!: { width: number; height: number };
  @Input() layoutData: InitLayoutData = {};
  @Output() exportResult = new EventEmitter();

  @ViewChild('sublineTopRef') sublineTopRef!: ElementRef<HTMLElement>;
  @ViewChild('sublineRightRef') sublineRightRef!: ElementRef<HTMLElement>;
  @ViewChild('sublineBottomRef') sublineBottomRef!: ElementRef<HTMLElement>;
  @ViewChild('sublineLeftRef') sublineLeftRef!: ElementRef<HTMLElement>;

  @ViewChild('targetElementRef') targetElementRef!: ElementRef<HTMLElement>;
  @ViewChildren('resultsRef') resultsRef!: QueryList<ElementRef<HTMLElement>>;

  materials = BLOCKS_MAP;

  materialsShow = true;
  cfgShow = false;
  cfgBlockActiveId?: string;

  coFields: FormlyFieldConfig[] = [];
  coForm = new FormGroup({});
  coModel: CoModel | null = null;

  cuFields: FormlyFieldConfig[] = [];
  cuForm = new FormGroup({});
  cuModel = {};

  rightmenuSelectedItem: KeyValue<string, InitBlockItem> | null = null;

  private sseUrlMap: Record<string, EventSourceUtil<any>> = {};
  private sseUrlSubscribers: Record<string, string[]> = {};
  private fetchControllers: Record<string, AbortController> = {};

  constructor(
    private formlyJsonschema: FormlyJsonschema,
    private injector: Injector,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['layoutData']) {
      const prev = changes['layoutData'].previousValue || {};
      const curr = changes['layoutData'].currentValue || {};

      let dataSourceChanged = false;
      for (const key of Object.keys(curr)) {
        const prevBlock = prev[key] || {};
        const currBlock = curr[key] || {};
        if (JSON.stringify(prevBlock.dataSource) !== JSON.stringify(currBlock.dataSource)) {
          dataSourceChanged = true;
          break;
        }
      }
      if (dataSourceChanged) {
        this.handleRequestDataSource(curr);
      }
    }
  }

  getComponent(itemName: ComponentOptionalName): any | null {
    return BLOCKS_MAP[itemName]?.component || null;
  }

  getComponentProps(itemKey: string): Record<string, any> {
    return {
      ...(this.layoutData[itemKey].props || {}),
      [X_BLOCK_DATA_SOURCE_KEY]: this.layoutData[itemKey]._dataResponse,
    };
  }
  // createBlockInjector(itemKey: string) {
  //   const block = this.layoutData[itemKey];
  //   return Injector.create({
  //     providers: [{ provide: '__data_source__', useValue: block._dataResponse }],
  //     parent: this.injector,
  //   });
  // }

  onDragover(ev: any) {
    ev.preventDefault();
  }

  onDrag(ev: any) {
    ev.dataTransfer.setData('itemName', ev.target.id);
    const previewId = ev.target.id + '_preview';
    ev.dataTransfer.setData('itemPreviewId', previewId);

    const previewElement = document.getElementById(previewId)!;
    const defaultSize = this.getDefauleItemSize(
      this.materials[ev.target.id].resizeable,
      previewElement,
    );
    previewElement.style.width = defaultSize.width + 'px';
    previewElement.style.height = defaultSize.height + 'px';
    ev.dataTransfer.setDragImage(previewElement, 0, 0);
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    const itemName = ev.dataTransfer!.getData('itemName') as ComponentOptionalName;
    const itemPreviewId = ev.dataTransfer!.getData('itemPreviewId');
    const itemPreviewElement = document.getElementById(itemPreviewId)!;
    const targetReultElment = this.targetElementRef.nativeElement;
    const rect = targetReultElment.getBoundingClientRect();
    const cursorPosition = { top: ev.clientY - rect.top, left: ev.clientX - rect.left };

    const position = this.calculatePosition(
      this.targetElementRef.nativeElement,
      itemPreviewElement,
      cursorPosition,
    );
    this.layoutData[Date.now().toString()] = {
      component: itemName,
      position,
      size: this.getDefauleItemSize(this.materials[itemName].resizeable, itemPreviewElement),
      layer: this.getNewLayer(this.layoutData),
      _tempPosition: position,
    };
    console.log(position);
  }
  onResizeMousedown(event: MouseEvent, key: string) {
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeOriginalWidth = this.layoutData[key].size.width;
    this.resizeOriginalHeight = this.layoutData[key].size.height;
    this.resizeItemKey = key;
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMousemove(event: MouseEvent) {
    if (this.resizeItemKey) {
      console.log(event.target);
      const dx = event.clientX - this.resizeStartX;
      const dy = event.clientY - this.resizeStartY;
      const item = this.layoutData[this.resizeItemKey!];
      const itemName = this.layoutData[this.resizeItemKey].component;
      const sizzeCfgg = this.materials[itemName].resizeable;
      // @ts-ignore
      if (sizzeCfgg?.ratioResize) {
        item.size.height = Math.max(
          Math.round(
            (this.resizeOriginalHeight! * (this.resizeOriginalWidth! + dx)) /
              this.resizeOriginalHeight!,
          ),
          1,
        );
        item.size.width = Math.max(this.resizeOriginalWidth + dx, 1);
      } else {
        // @ts-ignore
        if (sizzeCfgg?.widthResize) {
          item.size.width = Math.max(this.resizeOriginalWidth + dx, 1);
        }
        // @ts-ignore
        if (sizzeCfgg?.heightResize) {
          item.size.height = Math.max(this.resizeOriginalHeight + dy, 1);
        }
      }
    }
  }
  @HostListener('document:mouseup')
  onResizeMouseup(event: MouseEvent) {
    if (this.resizeItemKey) {
      this.sublinePositons = this.extractTopLeft(
        this.resultsRef.filter((item) => {
          return item.nativeElement.id !== this.resizeItemKey;
        }),
        document.getElementById(this.resizeItemKey!)!,
      );
      this.resizeItemKey = null;
    }
  }

  onHover(ev: MouseEvent) {
    const activeElement = ev.target! as HTMLElement;
    const itemId = activeElement.id.split('_pure')[0];
    const item = this.layoutData[itemId];
    this.showSubline(item.position, activeElement);
    this.sublinePositons = this.extractTopLeft(
      this.resultsRef.filter((item) => {
        return item.nativeElement.id !== itemId;
      }),
      activeElement,
    );
  }
  onHoverOut(ev: MouseEvent) {
    this.hideSubline();
  }
  onDragMoved(ev: CdkDragMove) {
    ev.event.preventDefault();
    const itemElement = ev.source.element.nativeElement;

    const itemId = itemElement.id;
    const item = this.layoutData[itemId];

    itemElement.style.transform = `translate3d(0px, 0px, 0px)`;
    if (!item._tempPosition) {
      item._tempPosition = item.position;
    }
    const cursorPosition = {
      top: item._tempPosition.top + ev.distance.y,
      left: item._tempPosition.left + ev.distance.x,
    };
    const calculatedPositon = this.calculatePosition(
      this.targetElementRef.nativeElement,
      itemElement,
      cursorPosition,
    );

    const alignedPosition = {
      top: this.findNearbyNumber(this.sublinePositons.tops, calculatedPositon.top),
      left: this.findNearbyNumber(this.sublinePositons.lefts, calculatedPositon.left),
    };
    this.showSubline(alignedPosition, itemElement);
    item.position = alignedPosition;
  }

  onDragEnded(ev: CdkDragEnd) {
    this.hideSubline();
    const itemElement = ev.source.element.nativeElement;
    const itemId = itemElement.id;
    const item = this.layoutData[itemId];
    const cursorPosition = item.position;
    const calculatedPosition = this.calculatePosition(
      this.targetElementRef.nativeElement,
      itemElement,
      cursorPosition,
    );
    item.position = calculatedPosition;
    item._tempPosition = calculatedPosition;

    this.updateCoCfgModel(itemId);
  }

  onDelelte(ev: MouseEvent, key: string) {
    delete this.layoutData[key];
    if (key === this.cfgBlockActiveId) {
      this.cfgBlockActiveId = undefined;
      this.cfgShow = false;
    }
  }
  onShowConfigBox(ev: MouseEvent, key: string) {
    this.cuForm = new FormGroup({});
    this.coForm = new FormGroup({});
    this.cfgShow = true;
    this.cfgBlockActiveId = key;
    const itemName = this.layoutData[key].component;
    this.cuFields = [
      this.formlyJsonschema.toFieldConfig(this.materials[itemName].propsSchema || {}),
    ];
    this.cuModel = this.layoutData[key].props || {};
    this.coFields = [
      this.formlyJsonschema.toFieldConfig(
        this.getCoCfgSchema(this.targetElementRef.nativeElement, document.getElementById(key)!),
      ),
    ];
    this.coModel = this.getCoCfgModel(key);
    this.cuForm.valueChanges.subscribe((data) => {
      this.cuForm.valid && (this.layoutData[key].props = data);
    });

    this.coForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((data: any) => {
        if (this.coForm.valid) {
          this.updateCoModelPosition2Render(key, data, this.targetElementRef.nativeElement);
          this.updateDataSource(key, this.layoutData);
          this.handleRequestDataSource(this.layoutData);
          // if (JSON.stringify(this.layoutData[key].dataSource) !== JSON.stringify(data.dataSource)) {
          //   this.updateDataSource(key, this.layoutData);
          //   this.handleRequestDataSource(this.layoutData);
          // }
        }
      });
  }

  onHideConfigBox() {
    this.cfgBlockActiveId = undefined;
    this.cfgShow = false;
  }

  onMoveLayerUp(itemKey: string) {
    this.changeLayerByKey(this.layoutData, itemKey, 'up');
  }
  onMoveLayerDown(itemKey: string) {
    this.changeLayerByKey(this.layoutData, itemKey, 'down');
  }

  private changeLayerByKey(
    source: InitLayoutData,
    targetId: string,
    direction: 'up' | 'down',
  ): InitLayoutData {
    const data = source;
    const target = data[targetId];
    if (!target) return data;

    const layers = Object.keys(data)
      .map((key) => data[key].layer)
      .sort((a, b) => a - b);
    const currentLayerIndex = layers.indexOf(target.layer);

    if (direction === 'up' && currentLayerIndex < layers.length - 1) {
      const nextLayer = layers[currentLayerIndex + 1];
      for (const key in data) {
        if (data[key].layer === nextLayer) {
          data[key].layer = target.layer;
          break;
        }
      }
      target.layer = nextLayer;
    } else if (direction === 'down' && currentLayerIndex > 0) {
      const prevLayer = layers[currentLayerIndex - 1];
      for (const key in data) {
        if (data[key].layer === prevLayer) {
          data[key].layer = target.layer;
          break;
        }
      }
      target.layer = prevLayer;
    }
    return data;
  }

  private getNewLayer(layoutData: InitLayoutData): number {
    return (
      (Object.values(layoutData)
        .map((item) => item.layer)
        .sort((a, b) => b - a)
        .shift() || 0) + 1
    );
  }

  private calculatePosition(
    targetElement: HTMLElement,
    itemElement: HTMLElement,
    targetPosition: { top: number; left: number },
  ) {
    const targetSize = { width: targetElement.clientWidth, height: targetElement.clientHeight };
    const itemSize = { width: itemElement.offsetWidth, height: itemElement.offsetHeight };
    const newPosition = targetPosition;

    newPosition.top = Math.round(Math.max(0, targetPosition.top));
    newPosition.left = Math.round(Math.max(0, targetPosition.left));
    newPosition.top = Math.round(Math.min(targetSize.height - itemSize.height, targetPosition.top));
    newPosition.left = Math.round(Math.min(targetSize.width - itemSize.width, targetPosition.left));
    return newPosition;
  }

  private showSubline(itemPosition: { top: number; left: number }, itemElement: HTMLElement) {
    const itemSize = {
      width: itemElement.offsetWidth,
      height: itemElement.offsetHeight,
    };
    this.sublineTopRef.nativeElement.style.top = Math.round(itemPosition.top) - 1 + 'px';
    this.sublineRightRef.nativeElement.style.left =
      Math.round(itemPosition.left + itemSize.width) + 'px';
    this.sublineBottomRef.nativeElement.style.top =
      Math.round(itemPosition.top + itemSize.height) + 'px';
    this.sublineLeftRef.nativeElement.style.left = Math.round(itemPosition.left - 1) + 'px';
  }
  private hideSubline() {
    this.sublineTopRef.nativeElement.style.top = '-2px';
    this.sublineRightRef.nativeElement.style.left = '-2px';
    this.sublineBottomRef.nativeElement.style.top = '-2px';
    this.sublineLeftRef.nativeElement.style.left = '-2px';
  }

  private extractTopLeft(
    blockElements: ElementRef<HTMLElement>[],
    activeElement: HTMLElement,
  ): { tops: number[]; lefts: number[] } {
    const tops: number[] = [];
    const lefts: number[] = [];
    const activeElementSize = {
      width: activeElement.offsetWidth,
      height: activeElement.offsetHeight,
    };
    blockElements.forEach((item) => {
      const _top = parseInt(item.nativeElement.style.top, 10);
      const _left = parseInt(item.nativeElement.style.left, 10);
      const offsetHeight = item.nativeElement.offsetHeight;
      const offsetWidth = item.nativeElement.offsetWidth;

      tops.push(
        _top,
        _top + offsetHeight,
        _top - activeElementSize.height + item.nativeElement.offsetHeight,
        _top - activeElementSize.height,
        _top + offsetHeight / 2,
        _top - activeElementSize.height + item.nativeElement.offsetHeight / 2,
      );
      lefts.push(
        _left,
        _left + offsetWidth,
        _left - activeElementSize.width + item.nativeElement.offsetWidth,
        _left - activeElementSize.width,
        _left + offsetWidth / 2,
        _left - activeElementSize.width + item.nativeElement.offsetWidth / 2,
      );
    });
    return { tops, lefts };
  }

  private findNearbyNumber(arr: number[], num: number, threshold: number = 5): number {
    for (let n of arr) {
      if (Math.abs(n - num) <= threshold) {
        return n;
      }
    }
    return num;
  }

  private getDefauleItemSize(
    resizeConfig: Resizeable | undefined,
    itemElement: HTMLElement,
  ): { width: number; height: number } {
    let size = { width: 100, height: 100 };
    if (!resizeConfig) {
      return {
        width: itemElement.getBoundingClientRect().width,
        height: itemElement.getBoundingClientRect().height,
      };
    } else {
      // @ts-ignore
      if (resizeConfig.heightResize && !resizeConfig.widthResize) {
        size = {
          // @ts-ignore
          width: resizeConfig.defaultWidth,
          height: itemElement.getBoundingClientRect().height,
        };
      }
      // @ts-ignore
      if (resizeConfig.widthResize & !resizeConfig.heightResize) {
        size = {
          // @ts-ignore
          width: resizeConfig.defaultWidth,
          height: itemElement.getBoundingClientRect().height,
        };
      }
      // @ts-ignore
      if ((resizeConfig.widthResize & resizeConfig.heightResize) | resizeConfig.ratioResize) {
        size = {
          // @ts-ignore
          width: resizeConfig.defaultWidth,
          // @ts-ignore
          height: resizeConfig.defaultHeight,
        };
      }
    }
    return size;
  }
  private updateDataSource(key: string, layoutData: InitLayoutData) {
    this.layoutData[key].dataSource = this.coModel?.dataSource;
  }
  private async handleRequestDataSource(layoutData: InitLayoutData) {
    // 关闭所有旧连接
    Object.values(this.sseUrlMap).forEach((instance) => instance.close());
    this.sseUrlMap = {};
    this.sseUrlSubscribers = {};

    Object.values(this.fetchControllers).forEach((controller) => controller.abort());
    this.fetchControllers = {};

    // 统计每个url有哪些block订阅
    for (const key of Object.keys(layoutData)) {
      const block = layoutData[key];
      block._dataResponse = null;
      const dataSource = block.dataSource;
      if (!dataSource || !dataSource.url || !dataSource.type || dataSource.url.length === 0) {
        continue;
      }
      if (!FetchUtil.isValidHttpUrl(dataSource.url)) {
        this.message.warning('数据源地址无效');
      }
      if (dataSource.type === 'HTTP') {
        try {
          const { promise, controller } = FetchUtil.getWithAbort<any>(dataSource.url);
          this.fetchControllers[key] = controller;
          const res = await promise;
          if (res.success) {
            block._dataResponse = res.data;
            console.log(block._dataResponse);
            this.cdr.detectChanges();
          } else {
            this.message.warning(res.message);
            block._dataResponse = null;
          }
        } catch (e: any) {
          this.message.warning(e.toString());
          block._dataResponse = null;
        } finally {
          delete this.fetchControllers[key];
        }
      } else if (dataSource.type === 'SSE') {
        // 记录订阅关系
        if (!this.sseUrlSubscribers[dataSource.url]) {
          this.sseUrlSubscribers[dataSource.url] = [];
        }
        this.sseUrlSubscribers[dataSource.url].push(key);
      }
    }

    // 为每个唯一url建立SSE连接，并分发数据
    for (const url of Object.keys(this.sseUrlSubscribers)) {
      try {
        this.sseUrlMap[url] = new EventSourceUtil<any>({
          url,
          onMessage: (data) => {
            // 分发给所有订阅该url的block
            for (const key of this.sseUrlSubscribers[url]) {
              const block = layoutData[key];
              block._dataResponse = data;
            }
            this.cdr.detectChanges();
          },
          onError: (err) => {
            this.sseUrlMap[url]?.close();
            this.message.warning(err.toString());
          },
        });
      } catch (e: any) {
        this.message.warning(e.toString());
      }
    }
  }
  private updateCoModelPosition2Render(key: string, data: CoModel, targetElement: HTMLElement) {
    const itemPreviewElement = document.getElementById(key)!;
    const calculatedPosition = this.calculatePosition(targetElement, itemPreviewElement, {
      top: data.top,
      left: data.left,
    });
    this.layoutData[key].position = calculatedPosition;
  }
  private updateCoCfgModel(key: string) {
    if (this.cfgBlockActiveId && this.cfgBlockActiveId === key) {
      this.coModel = this.getCoCfgModel(key);
    }
  }
  private getCoCfgModel(key: string): CoModel {
    return { ...this.layoutData[key].position, dataSource: { ...this.layoutData[key].dataSource } };
  }
  private getCoCfgSchema(targetElement: HTMLElement, itemElement: HTMLElement): JSONSchema7 {
    const targetSize = { width: targetElement.clientWidth, height: targetElement.clientHeight };
    const itemSize = { width: itemElement.offsetWidth, height: itemElement.offsetHeight };
    return {
      $schema: 'http://json-schema.org/draft-07/schema',
      type: 'object',
      required: ['top', 'left'],
      title: '基础信息',
      properties: {
        top: {
          type: 'number',
          title: 'Y坐标',
          description: '',
          default: 0,
          minimum: 0,
          maximum: targetSize.height - itemSize.height,
        },
        left: {
          type: 'number',
          title: 'X坐标',
          default: 0,
          minimum: 0,
          maximum: targetSize.width - itemSize.width,
        },
        dataSource: {
          type: 'object',
          title: '数据源',
          properties: {
            type: {
              type: 'string',
              title: '接口类型',
              enum: ['HTTP', 'SSE'],
            },
            url: {
              title: '接口地址（GET）',
              type: 'string',
            },
          },
        },
      },
    } as JSONSchema7;
  }
}
