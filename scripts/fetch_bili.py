#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_bili.py —— 读取 links.txt，自动抓取 B站 视频信息

它做的事：
  1. 读 links.txt 里的每个链接
  2. 调用 B站公开接口，拿到标题、封面、投稿时间、时长
  3. 写入 assets/items-bili.js

用法：
  本地：     python3 scripts/fetch_bili.py
  自动运行： GitHub Actions 会在 links.txt 变化时自动执行

不需要任何第三方库，用 Python 自带的工具即可运行。
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

# ---------- 基本配置 ----------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINKS_FILE = os.path.join(ROOT, "links.txt")
OUT_FILE = os.path.join(ROOT, "assets", "items-bili.js")

API = "https://api.bilibili.com/x/web-interface/view"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
TZ_CN = timezone(timedelta(hours=8))
SLEEP = 1.2  # 每个请求之间的间隔，避免触发风控

CAT_ALIAS = {
    "music": "music", "音乐作品": "music", "音乐": "music", "mv": "music",
    "live": "live", "现场演出": "live", "现场": "live", "演唱会": "live",
    "show": "show", "节目与访谈": "show", "节目": "show", "综艺": "show",
    "daily": "daily", "成员日常": "daily", "日常": "daily", "vlog": "daily",
}
MEDIA_ALIAS = {
    "video": "video", "视频": "video",
    "photo": "photo", "图集": "photo", "图片": "photo", "照片": "photo",
    "text": "text", "文字": "text", "长文": "text",
}


def parse_links(path):
    """把 links.txt 解析成 [{url, cat, media, tags}, ...]"""
    rows = []
    if not os.path.exists(path):
        return rows
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            parts = [p.strip() for p in line.split("|")]
            url = parts[0]
            if not url:
                continue
            cat_in = parts[1] if len(parts) > 1 else ""
            media_in = parts[2] if len(parts) > 2 else ""
            tags_in = parts[3] if len(parts) > 3 else ""

            cat = CAT_ALIAS.get(cat_in.lower(), CAT_ALIAS.get(cat_in, "")) or "daily"
            media = MEDIA_ALIAS.get(media_in.lower(), MEDIA_ALIAS.get(media_in, "")) or "video"
            tags = [t.strip() for t in re.split(r"[,，、]", tags_in) if t.strip()]
            rows.append({"url": url, "cat": cat, "media": media, "tags": tags})
    return rows


def bvid_of(url):
    """从各种 B站链接里提取 BV 号"""
    m = re.search(r"(BV[0-9A-Za-z]{10})", url)
    if m:
        return m.group(1)
    m = re.search(r"av(\d+)", url)
    if m:
        return "av" + m.group(1)
    return ""


def http_get(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Referer": "https://www.bilibili.com/",
        "Accept": "application/json, text/plain, */*",
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fmt_duration(sec):
    try:
        sec = int(sec)
    except (TypeError, ValueError):
        return ""
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    if h:
        return "%d:%02d:%02d" % (h, m, s)
    return "%02d:%02d" % (m, s)


def fix_cover(pic):
    """B站封面地址补全协议；空的就返回空串（页面会显示占位图）"""
    if not pic:
        return ""
    if pic.startswith("//"):
        return "https:" + pic
    if pic.startswith("http://"):
        return "https://" + pic[len("http://"):]
    return pic


def fetch_one(item):
    """抓一个视频，成功返回条目 dict，失败返回 None"""
    bvid = bvid_of(item["url"])
    if not bvid:
        print("  ! 无法识别 BV 号：" + item["url"])
        return None

    key = "bvid" if bvid.startswith("BV") else "aid"
    val = bvid if key == "bvid" else bvid[2:]
    api = API + "?" + urllib.parse.urlencode({key: val})

    try:
        data = http_get(api)
    except Exception as e:
        print("  ! 请求失败：" + str(e))
        return None

    if data.get("code") != 0:
        print("  ! 接口返回错误：code=%s msg=%s" % (data.get("code"), data.get("message")))
        return None

    d = data.get("data", {})
    pub = d.get("pubdate")
    date = ""
    if pub:
        date = datetime.fromtimestamp(int(pub), TZ_CN).strftime("%Y-%m-%d")

    return {
        "title": d.get("title", "").strip(),
        "url": "https://www.bilibili.com/video/" + d.get("bvid", bvid),
        "cover": fix_cover(d.get("pic", "")),
        "date": date,
        "cat": item["cat"],
        "media": item["media"],
        "platform": "B站",
        "duration": fmt_duration(d.get("duration")),
        "tags": item["tags"],
    }


def main():
    if not os.path.exists(LINKS_FILE):
        print("找不到 links.txt，退出。")
        return 1

    rows = parse_links(LINKS_FILE)
    print("共读取到 %d 个链接。" % len(rows))

    out = []
    for i, item in enumerate(rows, 1):
        print("[%d/%d] %s" % (i, len(rows), item["url"]))
        got = fetch_one(item)
        if got:
            out.append(got)
            print("  ✓ " + got["title"])
        if i < len(rows):
            time.sleep(SLEEP)

    # 按日期倒序排列
    out.sort(key=lambda x: x.get("date", ""), reverse=True)

    updated = datetime.now(TZ_CN).strftime("%Y-%m-%d %H:%M")
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write("/* ============================================================\n")
        f.write("   items-bili.js —— B站 内容（由 scripts/fetch_bili.py 自动生成）\n")
        f.write("   请不要手动编辑这个文件。\n")
        f.write("   最近更新：%s\n" % updated)
        f.write("   ============================================================ */\n")
        f.write("window.COLLECTION = window.COLLECTION || { items: [] };\n")
        f.write("window.COLLECTION.updatedAt = %s;\n" % json.dumps(updated, ensure_ascii=False))
        f.write("window.COLLECTION.items.push(\n")
        f.write(",\n".join("  " + json.dumps(o, ensure_ascii=False, indent=2).replace("\n", "\n  ") for o in out))
        f.write("\n);\n")

    print("\n完成：成功 %d / 共 %d。已写入 %s" % (len(out), len(rows), OUT_FILE))
    return 0


if __name__ == "__main__":
    sys.exit(main())
