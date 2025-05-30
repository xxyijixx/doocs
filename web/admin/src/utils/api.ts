import { methods } from '@dootask/tools';
import type { responseSuccess, responseError } from '@dootask/tools';
import type { UserBot } from '../types/dootask'

export type APIResponse = responseSuccess | responseError;

export interface ListResponse<T> extends responseSuccess {
  data: {
    list: T[];
  };
}


/**
 * 通用API请求方法，自动处理返回类型
 */
export async function dooTaskAPI(options: any): Promise<responseSuccess> {
  const response: APIResponse = await methods.requestAPI(options);
  if ('ret' in response) {
    // 这里可以抛出错误，或者返回一个统一的错误对象
    throw new Error(response.msg || '请求失败');
  }
  return response;
}

// 封装创建机器人接口
export async function createBot(data: { id: number; avatar: string[]; name: string }): Promise<responseSuccess> {
  return dooTaskAPI({
    url: '/api/users/bot/edit',
    method: 'POST',
    data: JSON.stringify(data),
  });
}





export async function getBotList(): Promise<ListResponse<UserBot>> {
  return dooTaskAPI({
    url: '/api/users/bot/list',
    method: 'GET',
  });
}

