/*
 * @Author         : Shang
 * @Date           : 2025-05-08
 * @LastEditors    : Shang
 * @LastEditTime   : 2025-05-09
 * @Description    :
 * Copyright (c) 2025 by Crepri, All Rights Reserved.
 */
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import JsonPointer from 'json-pointer';
import { FetchUtil } from '../../utils/FetchUtil';
import { debounceTime, Subject } from 'rxjs';
import EventSourceUtil from '../../utils/EventSource';

@Component({
  selector: 'crx-form-data-source-type',
  templateUrl: './data-source.type.component.html',
  styleUrls: ['./data-source.type.component.scss'],
  animations: [
    trigger('toggleExpand', [
      state('expand', style({})),
      state(
        'fold',
        style({
          height: 0,
          padding: 0,
          transform: 'scale(0)',
        }),
      ),
      transition('expand => fold', [animate('0.2s')]),
      transition('fold => expand', [animate('0.2s')]),
    ]),
  ],
})
export class DataSourceTypeComponent extends FieldType implements OnInit, OnDestroy {
  isExpand = true;
  apiPath: string = '';
  protocol: 'HTTP' | 'SSE' = 'SSE';
  apiResponse: string = '';

  private inputChange$ = new Subject<void>();
  private sseInstance: EventSourceUtil<any> | null = null;
  private fetchController: AbortController | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.inputChange$.pipe(debounceTime(300)).subscribe(() => {
      this.formControl.setValue({ type: this.protocol, url: this.apiPath });
      // this.handleInputChange();
    });
  }

  ngOnInit(): void {}

  toggleExpandAction() {
    this.isExpand = !this.isExpand;
  }

  onApiPathChange() {
    this.inputChange$.next();
  }

  onProtocolChange() {
    this.inputChange$.next();
  }

  async handleInputChange() {
    this.apiResponse = '';
    // 先关闭已有SSE连接
    if (this.sseInstance) {
      this.sseInstance.close();
      this.sseInstance = null;
    }
    // 先中断上一次fetch
    if (this.fetchController) {
      this.fetchController.abort();
      this.fetchController = null;
    }
    if (!FetchUtil.isValidHttpUrl(this.apiPath)) {
      // 这里可以设置错误提示
      console.warn('无效的URL');
      return;
    }
    if (this.protocol === 'HTTP') {
      // 支持可中断的fetch
      try {
        const { promise, controller } = FetchUtil.getWithAbort<any>(this.apiPath);
        this.fetchController = controller;
        const res = await promise;
        if (res.success) {
          console.log('HTTP数据', res);
          // this.formControl.setValue(res.data);
          this.apiResponse = JSON.stringify(res.data, null, 4);
        } else {
          console.warn('HTTP请求失败', res);
          this.apiResponse = JSON.stringify(res.message);
          this.cdr.detectChanges();
        }
      } catch (e) {
        console.warn('HTTP请求失败', e);
        this.apiResponse = JSON.stringify(4);
        this.cdr.detectChanges();
      } finally {
        this.fetchController = null;
      }
    } else if (this.protocol === 'SSE') {
      try {
        this.sseInstance = new EventSourceUtil<any>({
          url: this.apiPath,
          onMessage: (data) => {
            console.log('SSE数据', data);
            this.formControl.setValue(data);
            this.apiResponse = JSON.stringify(data, null, 4);
          },
          onError: (err) => {
            console.warn('SSE连接失败', err);
            this.sseInstance?.close();
            this.apiResponse = JSON.stringify(err);
            this.cdr.detectChanges();
          },
        });
      } catch (e) {
        console.warn('SSE初始化失败', e);
        this.apiResponse = JSON.stringify(e);
        this.cdr.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.sseInstance) {
      this.sseInstance.close();
      this.sseInstance = null;
    }
    if (this.fetchController) {
      this.fetchController.abort();
      this.fetchController = null;
    }
  }
}
