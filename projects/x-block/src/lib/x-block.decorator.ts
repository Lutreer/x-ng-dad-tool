/*
 * @Author         : Shang
 * @Date           : 2024-06-11
 * @LastEditors    : Shang
 * @LastEditTime   : 2025-05-07
 * @Description    :  
 * Copyright (c) 2025 by Crepri, All Rights Reserved. 
 */

import { FormlyFieldProps } from '@ngx-formly/core';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { AdditionalTypes } from './config-form';

export type BlockPropsWidget = {
  formlyConfig: {
    type?: AdditionalTypes;
    props?: FormlyFieldProps;
  };
};

export interface BlockPropsSchema extends JSONSchema7 {
  widget?: BlockPropsWidget;
  properties?: {
    [key: string]: JSONSchema7Definition & { widget?: BlockPropsWidget };
  };
}

export type Resizeable =
  | { widthResize: true; defaultWidth: number }
  | {
      heightResize: true;
      defaultHeight: number;
    }
  | { widthResize: true; defaultWidth: number; heightResize: true; defaultHeight: number }
  | {
      ratioResize: true;
      defaultHeight: number;
      defaultWidth: number;
    };

export type BlockRegisterConfig = {
  componentClass: any;
  key: string;
  name: string;
  propsSchema: BlockPropsSchema;
  resizeable?: Resizeable;
  thumbnail?:string;
}


export const BLOCKS_MAP: Record<
  string,
  {
    component: any;
    title: string;
    resizeable?: Resizeable;
    propsSchema?: BlockPropsSchema;
    thumbnail?:any
  }
> = {};
export const BLOCKS_COMPONENTS: any = [];

 export function register(config: BlockRegisterConfig){
  BLOCKS_COMPONENTS.push(config.componentClass);
  BLOCKS_MAP[config.key] = {
    component: config.componentClass,
    title: config.name,
    propsSchema: config.propsSchema
  };
  config.thumbnail && (BLOCKS_MAP[config.key].thumbnail = config.thumbnail);
  config.resizeable && (BLOCKS_MAP[config.key].resizeable = config.resizeable);
 }


export function XBlockRegister(arg: Omit<BlockRegisterConfig, 'componentClass'>) {
  return function (target: any) {
    register({
      componentClass:target,
      ...arg
    })
  };
}
