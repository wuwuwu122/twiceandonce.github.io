/* ============================================================
   data.js —— 全站配置与数据容器
   一般不需要改动这个文件。
   要加内容：B站 走 links.txt（自动抓取），其他平台改 items-manual.js
   ============================================================ */

window.COLLECTION = window.COLLECTION || {};

/* 四大分类：key 是内部标识，不要改；name 是页面上显示的名字，可以改 */
window.COLLECTION.categories = [
  { key: "music", name: "音乐作品", note: "MV · 打歌舞台 · 练习室 · 预告" },
  { key: "live",  name: "现场演出", note: "演唱会 · 巡演 · 舞台直拍" },
  { key: "show",  name: "节目与访谈", note: "团综 · 综艺 · 电台 · 专访" },
  { key: "daily", name: "成员日常", note: "Vlog · 直播 · 写真 · 图集" }
];

/* 三大媒介 */
window.COLLECTION.media = [
  { key: "video", name: "视频" },
  { key: "photo", name: "图集" },
  { key: "text",  name: "文字" }
];

/* 平台：这里列出的会生成筛选按钮；数据里出现但这里没列的平台也会自动补上 */
window.COLLECTION.platforms = ["B站", "微博", "小红书", "抖音"];

/* 所有内容都汇总到这里，由 items-bili.js 和 items-manual.js 填充 */
window.COLLECTION.items = [];
