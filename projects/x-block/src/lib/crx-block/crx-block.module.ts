/*
 * @Author         : Shang
 * @Date           : 2024-05-20
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-06-13
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenuItem, CdkMenu } from '@angular/cdk/menu';
import { MatRippleModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';

import { ObjectTypeComponent } from './config-form/object-type/object.type.component';
import { ArrayTypeComponent } from './config-form/array-type/array.type.component';
import { DeleteWidgetComponent } from './config-form/delete-widget/delete-widget.component';
import { CrxBlockToolComponent } from './crx-block-tool/crx-block-tools.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import configForm from './config-form';
import { ColorTypeComponent } from './config-form/color-type/color.type.component';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { BLOCKS_COMPONENTS, BLOCKS_MAP, BlockRegisterConfig, register } from './crx-block.decorator';

type Config = {
  blocks?:Array<BlockRegisterConfig>
}

const CRX_CONFIG_FORM = [
  DeleteWidgetComponent,
  ObjectTypeComponent,
  ArrayTypeComponent,
  ColorTypeComponent,
];

@NgModule({
  declarations: [CrxBlockToolComponent,  ...CRX_CONFIG_FORM],
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    MatRippleModule,
    ReactiveFormsModule,
    FormlyNgZorroAntdModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    MatIconModule,
    MatTooltipModule,
    NzColorPickerModule,
    FormlyModule.forRoot(configForm),
  ],
  exports: [CrxBlockToolComponent],
})
export class CrxBlockModule {
  static forRoot(config?:Config): ModuleWithProviders<CrxBlockModule>{
    config?.blocks?.forEach(el => {
      register(el)
    })
    return{
      ngModule: CrxBlockModule
    }
  }
}
