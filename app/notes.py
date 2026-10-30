"""把每条视频写成一份 Markdown 笔记（Obsidian 可以直接打开这个文件夹）。"""
import os
import re
import time
from pathlib import Path

from .config import library_dir

IMAGE_DIR = "_图片"   # 图文的图片放在笔记目录下的这个文件夹里（Obsidian 能直接显示）
BAD = re.compile(r'[\\/:*?"<>|\r\n\t#^\[\]]+')


TAG_RE = re.compile(r"#[^#\s]{1,20}\s*")   # 抖音标题里的一串话题标签


def clean_title(text, fallback="", n=50) -> str:
    """把抖音的原始描述整理成能当笔记名的短标题：去掉话题标签、多余空白和收尾标点。"""
    t = TAG_RE.sub(" ", text or "")
    t = re.sub(r"\s+", " ", t).strip()
    t = t.strip(" -—·|，,。.、~～")
    return (t[:n].rstrip(" -—·|，,。.、~～")) or (fallback or "未命名")


def safe_name(s: str, n=40) -> str:
    s = BAD.sub("-", s or "").strip(" .-")
    s = re.sub(r"-{2,}", "-", s)
    return (s[:n].rstrip(" .-")) or "未命名"


def _fmt_dur(sec):
    if not sec:
        return ""
    sec = int(sec)
    return f"{sec // 60}:{sec % 60:02d}"


def render(item: dict, md_dir: Path = None) -> str:
    n = item.get("note") or {}
    title = n.get("title") or item.get("title") or "未命名"
    lines = [
        "---",
        f'title: "{title.replace(chr(34), chr(39))}"',
        f'source: "{item.get("url") or item.get("local_path") or ""}"',
        f'author: "{(item.get("author") or "").replace(chr(34), chr(39))}"',
        f"category: {n.get('category') or '未分类'}",
        f"difficulty: {n.get('difficulty') or ''}",
        f"date: {time.strftime('%Y-%m-%d')}",
        "tags: [" + ", ".join(["抖音"] + (["图文"] if item.get("media_type") == "note" else [])
                              + [t.replace(",", " ") for t in n.get("tags", [])]) + "]",
        "---",
        "",
        f"# {title}",
        "",
    ]
    meta = []
    if item.get("author"):
        meta.append(f"作者：{item['author']}")
    if item.get("duration"):
        meta.append(f"时长：{_fmt_dur(item['duration'])}")
    if item.get("url"):
        meta.append(f"[打开原{'图文' if item.get('media_type') == 'note' else '视频'}]({item['url']})")
    if meta:
        lines += [" · ".join(meta), ""]
    if item.get("title") and item.get("title") != title:
        orig = "\n".join(l.strip() for l in str(item["title"]).splitlines() if l.strip())
        lines += ["> 原标题：" + orig.replace("\n", "\n> "), ""]

    def section(name, body):
        if body:
            lines.extend([f"## {name}", "", *body, ""])

    one = (n.get("one_line") or n.get("summary") or "").strip()
    section("一句话总结", [one] if one else [])
    if item.get("images"):
        lib = library_dir()
        body = []
        for i, rel in enumerate(item["images"], 1):
            target = lib / rel
            link = os.path.relpath(target, md_dir).replace(os.sep, "/") if md_dir else rel
            body.append(f"![图{i}](<{link}>)")
        section("原图", body)
    sum_md = (n.get("summary_md") or "").strip()
    log_md = (n.get("logic_md") or "").strip()
    if sum_md:
        section("核心内容拆解", [sum_md])
    if log_md:
        section("主线逻辑", [log_md])
    if not sum_md and not log_md:
        # 还没按新结构重新提炼过的老笔记：保留旧版区块，别让内容凭空消失
        section("核心观点", [f"- {p}" for p in n.get("points", [])])
        section("照着做", [f"{i}. {s}" for i, s in enumerate(n.get("steps", []), 1)])
        section("提到的工具", [f"- **{t['name']}**：{t.get('use', '')}" for t in n.get("tools", [])])
        section("关键概念", [f"- **{c['term']}**：{c.get('explain', '')}" for c in n.get("concepts", [])])
        if n.get("quiz"):
            body = []
            for i, q in enumerate(n["quiz"], 1):
                body += [f"**{i}. {q['q']}**", "", f"> 答案：{q.get('a', '')}", ""]
            section("自测题", body)
    mm = (item.get("mindmap") or n.get("mindmap") or "").strip()
    if mm:
        section("思维导图", ["```markmap", mm, "```"])
    if (item.get("my_note") or "").strip():
        section("我的笔记", [item["my_note"].strip()])
    if item.get("transcript"):
        lines += ["## 原文转录", "", "<details><summary>展开完整文字稿</summary>", "",
                  item["transcript"], "", "</details>", ""]
    return "\n".join(lines)


def write(item: dict) -> str:
    """写入（或覆盖）笔记文件，返回文件路径。"""
    n = item.get("note") or {}
    root = library_dir()
    folder = root / safe_name(n.get("category") or "未分类", 20)
    folder.mkdir(parents=True, exist_ok=True)
    base = safe_name(n.get("title") or item.get("title") or f"视频{item['id']}")
    path = folder / f"{base}.md"
    old = item.get("md_path")
    if path.exists() and str(path) != old:
        path = folder / f"{base}-{item['id']}.md"
    path.write_text(render(item, folder), encoding="utf-8")
    if old and old != str(path):
        try:
            Path(old).unlink(missing_ok=True)
        except Exception:
            pass
    return str(path)


def remove(item: dict, with_images=False):
    if item.get("md_path"):
        try:
            Path(item["md_path"]).unlink(missing_ok=True)
        except Exception:
            pass
    if with_images and item.get("images"):
        import shutil
        lib = library_dir()
        folder = (lib / item["images"][0]).parent
        if folder.parent == lib / IMAGE_DIR:  # 只删自己的图片文件夹
            shutil.rmtree(folder, ignore_errors=True)
