# TWICE 收藏集 · 小白操作说明

一个纯静态网站：把你收藏的 TWICE 视频、图集、文字内容汇总成一个可搜索、可筛选的页面。
所有内容点击后都跳转到原平台（B站 / 微博 / 小红书 / 抖音）观看。

---

## 一、文件都是干什么的

```
twice-collection/
├─ index.html               网站的页面（一般不用动）
├─ assets/
│  ├─ style.css             样式（不用动）
│  ├─ app.js                页面逻辑（不用动）
│  ├─ data.js               分类、媒介、平台配置（想改分类名字时动这里）
│  ├─ items-bili.js         B站内容（自动生成，不要手动改）
│  └─ items-manual.js       手动录入的内容（微博/小红书/抖音、图集、文字）
├─ links.txt                你往里粘 B站 链接
├─ scripts/
│  └─ fetch_bili.py         抓取脚本（不用动）
├─ .github/workflows/
│  └─ update.yml            自动更新配置（不用动）
└─ .nojekyll                固定文件，必须保留
```

---

## 二、第一次上线（约 10 分钟）

### 1. 新建仓库
登录 GitHub → 右上角 `+` → `New repository`。
- `Repository name` 可以填 `twice.github.io`（把 twice 换成你的用户名，网址会更短），也可以随便填比如 `twice-collection`。
- 一定要选 **Public**。
- 点绿色 `Create repository`。

### 2. 上传文件
进入仓库 → `Add file` → `Upload files`。
把整个 `twice-collection` 文件夹里的**所有文件和文件夹**拖进去（注意 `.github` 和 `.nojekyll` 这两个要一起拖）。
拖完点底部绿色 `Commit changes`。

> 如果拖拽后看不到 `.github` 文件夹，说明系统把隐藏文件过滤了。可以在上传页把文件先解压成文件夹再拖，或者用 GitHub 网页的 `Add file → Create new file` 手动建。

### 3. 打开 Pages 开关
仓库页面 → `Settings` → 左侧 `Pages`。
- `Source` 选 `Deploy from a branch`
- `Branch` 选 `main`，右边文件夹选 `/ (root)`
- 点 `Save`

等 1~3 分钟，刷新这个页面，顶部出现 `Your site is live at ...` 就成功了。

### 4. 绑定你的域名
还在 `Pages` 页面：
- `Custom domain` 填你已买好的域名，点 `Save`
- 去你的域名服务商后台，加一条解析记录：
  - 类型 `CNAME`，名称 `www`（或 `@`），值填 `你的用户名.github.io`
- 回到 `Pages` 页面，等它显示 DNS 检查通过，勾上 `Enforce HTTPS`

DNS 生效通常几分钟，偶尔要几小时，期间打不开是正常的。

---

## 三、以后怎么加内容

### 加 B站 内容（推荐，最省事）
1. 打开仓库里的 `links.txt`
2. 点右上角铅笔图标进入编辑
3. 按这个格式加一行：

```
B站视频链接 | 分类 | 媒介 | 标签
```

比如：
```
https://www.bilibili.com/video/BV1xx411c7mD | 音乐作品 | 视频 | 回归期
```

分类填：`音乐作品` / `现场演出` / `节目与访谈` / `成员日常`
媒介填：`视频` / `图集` / `文字`
后面的分类、媒介、标签都可以省略，默认是「成员日常 + 视频」。

4. 拉到页面底部，点绿色 `Commit changes`
5. 等 1~2 分钟，GitHub 自动帮你抓取标题、封面、日期，网站自动更新

### 加微博 / 小红书 / 抖音内容（手动）
1. 打开 `assets/items-manual.js`
2. 复制一段现成的 `{ ... }`，粘贴到示例下面，改成你的内容
3. 至少填这四个：`title`（标题）、`url`（链接）、`date`（日期）、`cat`（分类）
4. 提交后网站自动更新

`cat` 填 `music` / `live` / `show` / `daily`
`media` 填 `video` / `photo` / `text`
图集记得加 `count: 张数`，视频记得加 `duration: "12:05"`

---

## 四、常见问题

**页面 404？**
先确认文件名是 `index.html`（全小写），并且放在仓库根目录。再等 5 分钟。

**改了内容刷新看不到？**
浏览器缓存。按 `Ctrl + F5`（Mac 是 `Command + Shift + R`）强制刷新。

**自动抓取没跑？**
去仓库的 `Actions` 标签页看运行记录。如果是 `Content` 权限问题，检查 `Settings → Actions → General → Workflow permissions` 是否选了 `Read and write permissions`。

**封面显示不出来（裂图）？**
页面已自动降级为占位图，不会破版。B站图通常能显示；其他平台严格的话属于正常现象。

**抓取报 412 错误？**
B站的风控。等一会儿再试，或降低链接数量分批提交。频繁提交时它会临时拒绝。

**想改分类名字？**
改 `assets/data.js` 里的 `name`，比如把「成员日常」改成「成员日常 / 写真」。内部 `key` 不要动。

---

## 五、版权说明

本站仅为个人内容收藏与导航页面。所有视频、图片、文字的版权归原作者与原平台所有，点击卡片会跳转到原站观看。
