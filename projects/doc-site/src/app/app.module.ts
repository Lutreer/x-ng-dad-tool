/*
 * @Author         : Shang
 * @Date           : 2024-06-12
 * @LastEditors    : Shang
 * @LastEditTime   : 2025-05-12
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzTableModule } from 'ng-zorro-antd/table';

import { AppComponent } from './app.component';
import { XBlockModule } from '../../../x-block/src/public-api';
import { TableComponent } from './material-components/table/table.component';
import { BarChartComponent } from './material-components/bar-chart/bar-chart.component';
import { CardComponent } from './material-components/card-component/card.component';
import { TextComponent } from './material-components/text-component/text.component';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { provideHttpClient } from '@angular/common/http';
@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    BarChartComponent,
    CardComponent,
    TextComponent,
    // 其他组件
  ],
  // providers: [
  //   provideAnimationsAsync(),
  //   provideHttpClient()
  // ],
  bootstrap: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, XBlockModule.forRoot(), NzTableModule],
})
export class AppModule {}
