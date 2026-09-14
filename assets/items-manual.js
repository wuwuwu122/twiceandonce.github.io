/* ============================================================
   items-manual.js —— 手动录入的内容
   微博 / 小红书 / 抖音 以及图集、文字内容，在这里手动添加。
   加一条 = 复制一段花括号 { ... }，改里面的内容即可。
   ------------------------------------------------------------
   字段说明：
     title    标题（必填）
     url      原站链接（必填，就是点击后要跳转的地址）
     cover    封面图地址（可留空 ""，会显示按分类配色的占位图）
     date     投稿日期，格式 2025-07-11（必填，用于排序和筛选）
     cat      分类：music / live / show / daily
     media    媒介：video / photo / text
     platform 平台：B站 / 微博 / 小红书 / 抖音
     duration 时长（视频填，如 "12:05"；图集和文字留空或删除）
     count    张数（图集填，如 24；其他可删除）
     tags     标签数组，用于搜索，如 ["娜琏", "回归期"]
     note     备注（可选，搜索也会匹配；比如写 "2024.12 首尔场"）
   ============================================================ */
window.COLLECTION = window.COLLECTION || { items: [] };

window.COLLECTION.items.push(
  /* ↓↓↓ 下面是示例，熟悉格式后可以直接删掉 ↓↓↓ */
  {
    title: "九周年 直播回放",
    url: "https://www.bilibili.com/video/BV1xx411c7mD",
    cover: "",
    date: "2025-10-20",
    cat: "daily",
    media: "video",
    platform: "B站",
    duration: "1:22:40",
    tags: ["直播"]
  },
  {
    title: "机场穿搭 图集",
    url: "https://weibo.com/",
    cover: "",
    date: "2026-09-02",
    cat: "daily",
    media: "photo",
    platform: "微博",
    count: 18,
    tags: ["图集"]
  },
  {
    title: "杂志专访 全文记录",
    url: "https://weibo.com/",
    cover: "",
    date: "2026-06-15",
    cat: "show",
    media: "text",
    platform: "微博",
    tags: ["访谈"],
    note: "2026.06 回归期专访"
  }
  /* ↑↑↑ 示例结束 ↑↑↑ */
);
