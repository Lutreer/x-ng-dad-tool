/*
 * @Author         : Shang
 * @Date           : 2025-05-08
 * @LastEditors    : Shang
 * @LastEditTime   : 2025-05-09
 * @Description    :
 * Copyright (c) 2025 by Crepri, All Rights Reserved.
 */
export interface ICommon<T> {
  code: string;
  data: T;
  message: string;
  success: boolean;
}

export class FetchUtil {
  static async get<T>(url: string, options?: RequestInit): Promise<ICommon<T>> {
    const response = await fetch(url, {
      method: 'GET',
      ...options,
    });
    if (!response.ok) {
      return {
        code: response.status.toString(),
        data: undefined as any,
        message: response.statusText,
        success: false,
      };
    }
    try {
      const result = await response.json();
      // 假设后端直接返回ICommon结构，否则做适配
      return result;
    } catch (e) {
      return {
        code: response.status.toString(),
        data: undefined as any,
        message: 'Invalid JSON response',
        success: false,
      };
    }
  }

  static isValidHttpUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static getWithAbort<T>(
    url: string,
    options?: RequestInit,
  ): { promise: Promise<ICommon<T>>; controller: AbortController } {
    const controller = new AbortController();
    const fetchPromise = fetch(url, {
      method: 'GET',
      signal: controller.signal,
      ...options,
    })
      .then(async (response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/event-stream')) {
          return {
            code: response.status.toString(),
            data: undefined as any,
            message: '错误：这是一个实时数据接口',
            success: false,
          };
        }

        if (!response.ok) {
          return {
            code: response.status.toString(),
            data: undefined as any,
            message: response.statusText,
            success: false,
          };
        }
        try {
          const result = await response.json();
          return result;
        } catch (e) {
          return {
            code: response.status.toString(),
            data: undefined as any,
            message: '数据解析失败',
            success: false,
          };
        }
      })
      .catch((e) => {
        return {
          code: '-1',
          data: undefined as any,
          message: e?.message || 'Request aborted or failed',
          success: false,
        };
      });
    return { promise: fetchPromise, controller };
  }
}
