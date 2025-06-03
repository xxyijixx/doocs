import { methods } from "@dootask/tools";
import type {
  requestParams,
  responseSuccess,
  responseError,
} from "@dootask/tools";
import type { UserBot } from "../types/dootask";

export type APIResponse = responseSuccess | responseError;

export interface ListResponse<T> extends responseSuccess {
  data: {
    list: T[];
  };
}

/**
 * 通用API请求方法，自动处理返回类型
 */
export async function dooTaskAPI(
  options: requestParams
): Promise<responseSuccess> {
  const response: APIResponse = await methods.requestAPI(options);
  if ("ret" in response) {
    // 这里可以抛出错误，或者返回一个统一的错误对象
    throw new Error(response.msg || "请求失败");
  }
  return response;
}

// 封装创建机器人接口
export async function createBot(data: {
  id: number;
  avatar: string[];
  name: string;
}): Promise<responseSuccess> {
  return dooTaskAPI({
    url: "/api/users/bot/edit",
    method: "POST",
    data: JSON.stringify(data),
  });
}

export async function getBotList(): Promise<ListResponse<UserBot>> {
  return dooTaskAPI({
    url: "/api/users/bot/list",
    method: "GET",
  });
}

// 创建项目
export async function createProject(data: {
  name: string;
  flow: boolean;
}): Promise<responseSuccess> {
  const queryString = `name=${encodeURIComponent(data.name)}&flow=${data.flow}`;
  return dooTaskAPI({
    url: `/api/project/add?${queryString}`,
    method: "GET",
  });
}

// 请求
// {
//   "cascader": [
//       15,
//       50
//   ],
//   "name": "任务1",
//   "content": "<p>描述1</p>",
//   "owner": [],
//   "assist": [],
//   "project_id": 15,
//   "column_id": 50,
//   "times": [
//       "",
//       ""
//   ],
//   "subtasks": [],
//   "p_level": 1,
//   "p_name": "重要且紧急",
//   "p_color": "#ED4014",
//   "visibility_appoint": 1,
//   "visibility_appointor": []
// }
// 响应
// {
//   "ret": 1,
//   "msg": "\u6dfb\u52a0\u6210\u529f",
//   "data": {
//       "id": 97,
//       "parent_id": 0,
//       "project_id": 15,
//       "column_id": 50,
//       "dialog_id": 0,
//       "flow_item_id": 0,
//       "flow_item_name": "",
//       "name": "\u4efb\u52a11",
//       "color": "",
//       "desc": "\u63cf\u8ff01",
//       "start_at": null,
//       "end_at": null,
//       "archived_at": null,
//       "archived_userid": 0,
//       "archived_follow": 0,
//       "complete_at": null,
//       "userid": 1,
//       "visibility": 1,
//       "p_level": 1,
//       "p_name": "\u91cd\u8981\u4e14\u7d27\u6025",
//       "p_color": "#ED4014",
//       "sort": 1,
//       "loop": "",
//       "loop_at": null,
//       "created_at": "2025-05-30 17:20:24",
//       "updated_at": "2025-05-30 17:20:24",
//       "deleted_at": null,
//       "deleted_userid": 0,
//       "owner": null,
//       "assist": 0,
//       "is_visible": 1,
//       "file_num": 0,
//       "msg_num": 0,
//       "sub_num": 0,
//       "sub_complete": 0,
//       "percent": 0,
//       "today": false,
//       "overdue": false,
//       "task_user": [],
//       "task_tag": []
//   }
// }
export async function createTask(data: {
  name: string;
  content: string;
  project_id: number;
}): Promise<responseSuccess> {
  return dooTaskAPI({
    url: "/api/project/task/add",
    method: "POST",
    data: JSON.stringify(data),
  });
}

// 获取任务聊天
// 响应
// {
//   "ret": 1,
//   "msg": "success",
//   "data": {
//       "id": 98,
//       "dialog_id": 58,
//       "dialog_data": {
//           "id": 58,
//           "type": "group",
//           "group_type": "task",
//           "session_id": 0,
//           "name": "\u667a\u80fd\u5ba2\u670d\u4efb\u52a11",
//           "avatar": "",
//           "owner_id": 0,
//           "link_id": 0,
//           "top_userid": 0,
//           "top_msg_id": 0,
//           "created_at": "2025-05-30 17:33:02",
//           "updated_at": "2025-05-30 17:33:02",
//           "deleted_at": null,
//           "top_at": null,
//           "last_at": null,
//           "mark_unread": null,
//           "silence": null,
//           "hide": null,
//           "color": null,
//           "user_at": null,
//           "unread": 0,
//           "unread_one": 0,
//           "mention": 0,
//           "mention_ids": [],
//           "people": 0,
//           "people_user": 0,
//           "people_bot": 0,
//           "todo_num": 0,
//           "last_msg": null,
//           "pinyin": "zhinengkefurenwu1",
//           "quick_msgs": [],
//           "dialog_user": null,
//           "group_info": {
//               "id": 98,
//               "name": "\u667a\u80fd\u5ba2\u670d\u4efb\u52a11",
//               "complete_at": null,
//               "archived_at": null,
//               "deleted_at": null
//           },
//           "bot": 0
//       }
//   }
// }
export async function getTaskDialog(task_id: number): Promise<responseSuccess> {
  return dooTaskAPI({
    url: `/api/project/task/dialog?task_id=${task_id}`,
    method: "GET",
  });
}

// 发送消息
// 参数
// {
//   "dialog_id": 58,
//   "reply_id": 0,
//   "text": "<p><span class=\"mention\" data-index=\"1\" data-denotation-char=\"@\" data-id=\"11\" data-value=\"客服机器人\" contenteditable=\"false\"><span contenteditable=\"false\"><span class=\"ql-mention-denotation-char\">@</span>客服机器人</span></span> 初始化</p>",
//   "text_type": "text",
//   "silence": "no"
// }
// 响应
// {
//   "ret": 1,
//   "msg": "\u53d1\u9001\u6210\u529f",
//   "data": {
//       "dialog_id": 58,
//       "dialog_type": "group",
//       "session_id": 0,
//       "reply_id": 0,
//       "forward_id": 0,
//       "userid": 1,
//       "type": "text",
//       "mtype": "text",
//       "link": 0,
//       "bot": 0,
//       "msg": {
//           "text": "<p><span class=\"mention user\" data-id=\"11\">@\u5ba2\u670d\u673a\u5668\u4eba<\/span> \u521d\u59cb\u5316<\/p>"
//       },
//       "read": 0,
//       "send": 1,
//       "created_at": "2025-05-30 17:33:03",
//       "id": 137,
//       "percentage": 0
//   }
// }
export async function sendMessage(data: {
  dialog_id: number;
  reply_id?: number;
  text: string;
  text_type?: string;
  silence?: string;
}): Promise<responseSuccess> {
  const messageData = {
    ...data,
    reply_id: data.reply_id || 0,
    text_type: data.text_type || 'text',
    silence: data.silence || 'no'
  };
  
  return dooTaskAPI({
    url: "/api/dialog/msg/sendtext",
    method: "POST",
    data: JSON.stringify(messageData),
  });
}

/**
 * 生成mention类型的消息HTML字符串
 * @param id data-id的值
 * @param value data-value的值
 * @param text 后续的文本内容
 * @returns mention消息的HTML字符串
 */
export function generateMentionMessage(
  id: number,
  value: string,
  text: string
): string {
  return `<p><span class="mention" data-index="1" data-denotation-char="@" data-id="${id}" data-value="${value}" contenteditable="false"><span contenteditable="false"><span class="ql-mention-denotation-char">@</span>${value}</span></span> ${text}</p>`;
}
