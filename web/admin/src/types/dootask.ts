// data中的数据：
// "list": [
//             {
//                 "clear_day": 90,
//                 "webhook_url": "",
//                 "id": 33,
//                 "name": "\u5ba2\u670d\u673a\u5668\u4eba",
//                 "avatar": "http:\/\/192.168.31.214\/avatar\/%E5%AE%A2%E6%9C%8D%E6%9C%BA%E5%99%A8%E4%BA%BA.png",
//                 "system_name": ""
//             },
//             {
//                 "clear_day": 90,
//                 "webhook_url": "",
//                 "id": 32,
//                 "name": "\u5ba2\u670d\u673a\u5668\u4eba",
//                 "avatar": "http:\/\/192.168.31.214\/avatar\/%E5%AE%A2%E6%9C%8D%E6%9C%BA%E5%99%A8%E4%BA%BA.png",
//                 "system_name": ""
//             },
//         ]
export interface UserBot {
    clear_day: number;
    webhook_url: string;
    id: number;
    name: string;
    avatar: string;
    system_name: string;
  }
  
export interface ProjectUser {
  id: number
  project_id: number
  userid: number
  owner: number
  top_at: unknown
  created_at: string
  updated_at: string
}