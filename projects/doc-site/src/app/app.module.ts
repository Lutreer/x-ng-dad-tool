/*
 * @Author         : Shang
 * @Date           : 2024-06-12
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-06-13
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button';
import { CrxBlockModule, XBlockComponent } from '../../../x-block/src/public-api';
import { Component1xComponent } from './material-components/component1x/component1x.component';
import { Component1Component } from './material-components/component1/component1.component';
import { Component2Component } from './material-components/component2/component2.component';

@NgModule({
    declarations: [
        AppComponent,
        Component1xComponent,
        Component1Component,
        Component2Component
        // 其他组件
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatButtonModule,
        XBlockComponent,


        CrxBlockModule.forRoot(),

    ]
})
export class AppModule { }
