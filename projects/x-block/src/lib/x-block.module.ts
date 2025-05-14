/*
 * @Author         : Shang
 * @Date           : 2024-05-20
 * @LastEditors    : Shang
 * @LastEditTime   : 2025-05-08
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenuItem, CdkMenu } from '@angular/cdk/menu';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';

import { ObjectTypeComponent } from './config-form/object-type/object.type.component';
import { ArrayTypeComponent } from './config-form/array-type/array.type.component';
import { DataSourceTypeComponent } from './config-form/data-source-type/data-source.type.component';

import { DeleteWidgetComponent } from './components/delete-widget/delete-widget.component';

import { MatIconModule } from '@angular/material/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import configForm from './config-form';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { BlockRegisterConfig, register } from './x-block.decorator';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { XBlockToolComponent } from './x-block-tool/x-block-tools.component';
import { HttpClientModule } from '@angular/common/http';
import { XIconComponent } from './x-icon/x-icon.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

type Config = {
  blocks?: Array<BlockRegisterConfig>;
};

const CRX_CONFIG_FORM = [
  DeleteWidgetComponent,
  ObjectTypeComponent,
  ArrayTypeComponent,
  DataSourceTypeComponent,
];

@NgModule({
  declarations: [XBlockToolComponent, XIconComponent, ...CRX_CONFIG_FORM],
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    MatRippleModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormlyNgZorroAntdModule,
    HttpClientModule,

    NzButtonModule,
    NzColorPickerModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,

    FormsModule,
    FormlyModule.forRoot(configForm),
  ],
  exports: [XBlockToolComponent],
})
export class XBlockModule {
  static forRoot(config?: Config): ModuleWithProviders<XBlockModule> {
    config?.blocks?.forEach((el) => {
      register(el);
    });
    return {
      ngModule: XBlockModule,
    };
  }
}
