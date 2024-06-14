/*
 * @Author         : Shang
 * @Date           : 2024-05-22
 * @LastEditors    : Shang
 * @LastEditTime   : 2024-05-27
 * @Description    :
 * Copyright (c) 2024 by Crepri, All Rights Reserved.
 */
import { NullTypeComponent } from './null-type/null.type.component';
import { ArrayTypeComponent } from './array-type/array.type.component';
import { ObjectTypeComponent } from './object-type/object.type.component';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ColorTypeComponent } from './color-type/color.type.component';
export function minItemsValidationMessage(error: any, field: FormlyFieldConfig) {
  return `不能少于${field.props?.['minItems']}项`;
}

export function maxItemsValidationMessage(error: any, field: FormlyFieldConfig) {
  return `不能多于${field.props?.['maxItems']}项`;
}

export function minLengthValidationMessage(error: any, field: FormlyFieldConfig) {
  return `长度不能小于${field.props?.minLength}`;
}

export function maxLengthValidationMessage(error: any, field: FormlyFieldConfig) {
  return `长度不能大于${field.props?.maxLength} characters`;
}

export function minValidationMessage(error: any, field: FormlyFieldConfig) {
  return `应该大于等于${field.props?.min}`;
}

export function maxValidationMessage(error: any, field: FormlyFieldConfig) {
  return `应该小于等于${field.props?.max}`;
}

export function constValidationMessage(error: any, field: FormlyFieldConfig) {
  return `应该等于"${field.props?.['const']}"`;
}

export function typeValidationMessage({ schemaType }: any) {
  return `类型错误，应该是"${schemaType[0]}".`;
}
export default {
  validationMessages: [
    { name: 'required', message: '不能为空' },
    { name: 'type', message: typeValidationMessage },
    { name: 'minLength', message: minLengthValidationMessage },
    { name: 'maxLength', message: maxLengthValidationMessage },
    { name: 'min', message: minValidationMessage },
    { name: 'max', message: maxValidationMessage },
    { name: 'minItems', message: minItemsValidationMessage },
    { name: 'maxItems', message: maxItemsValidationMessage },
    { name: 'uniqueItems', message: '不能有多个' },
    { name: 'const', message: constValidationMessage },
    { name: 'enum', message: `超出了可选择的范围` },
  ],
  types: [
    { name: 'null', component: NullTypeComponent, wrappers: ['form-field'] },
    { name: 'array', component: ArrayTypeComponent },
    { name: 'object', component: ObjectTypeComponent },
    { name: 'color', component: ColorTypeComponent, wrappers: ['form-field'] },
  ],
};

export type AdditionalTypes = 'colors';
