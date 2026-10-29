"""SQLite 条目库。每条视频一行，记录处理状态、文字稿、AI 笔记和学习进度。"""
import json
import sqlite3
import threading
import time

from .config import DB_PATH

# 状态：
#   queued       等待处理
#   fetching     读取视频信息
#   downloading  下载中
#   transcribing 转文字中
#   extracting   AI 提炼中
#   done         完成，可以学习
#   need_key     已转成文字，但没配 AI Key，等配好后再提炼
#   irrelevant   和关注主题无关（自动收起，不算失败）
#   skipped      广告 / 图文 / 纯音乐 / 无对白，自动跳过
#   failed       失败，可以重试
ACTIVE = ("fetching", "downloading", "transcribing", "extracting")

SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'link',      -- link / favorite / local
  aweme_id TEXT UNIQUE,
  url TEXT,
  local_path TEXT,
  title TEXT,
  author TEXT,
  duration REAL,
  cover TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  reason TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  transcript TEXT,
  note_json TEXT,
  category TEXT,
  md_path TEXT,
  learned INTEGER NOT NULL DEFAULT 0,
  starred INTEGER NOT NULL DEFAULT 0,
  my_note TEXT NOT NULL DEFAULT '',
  created_at REAL NOT NULL,
  updated_at REAL NOT NULL,
  learned_at REAL
);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort INTEGER NOT NULL DEFAULT 0,
  seen_at REAL NOT NULL DEFAULT 0,     -- 上次点开这个文件夹的时间，用来算小红点
  created_at REAL NOT NULL
);
"""

_local = threading.local()
_write_lock = threading.Lock()


def conn():
    c = getattr(_local, "conn", None)
    if c is None:
        c = sqlite3.connect(DB_PATH, timeout=30)
        c.row_factory = sqlite3.Row
        c.execute("PRAGMA journal_mode=WAL")
        _local.conn = c
    return c


EXTRA_COLUMNS = {
    "segments_json": "TEXT",   # 带时间戳的文字稿分段
    "deep_json": "TEXT",       # 精读结果（旧功能保留数据，界面已不再使用）
    "chat_json": "TEXT",       # 精读里的答题点评、问老师记录
    "media_type": "TEXT",      # video / note（图文）
    "images_json": "TEXT",     # 图文的图片（相对于笔记目录的路径列表）
    "mindmap": "TEXT",         # Markmap 文本，独立生成，不再依赖精读
    "folder_id": "INTEGER",    # 所属文件夹；NULL 就是「待分类」
}


def init():
    with _write_lock:
        conn().executescript(SCHEMA)
        have = {r["name"] for r in conn().execute("PRAGMA table_info(items)")}
        for col, typ in EXTRA_COLUMNS.items():
            if col not in have:  # 老版本的数据库自动升级
                conn().execute(f"ALTER TABLE items ADD COLUMN {col} {typ}")
        # 老笔记的思维导图原本存在精读结果里，搬到新字段（只补空值，不覆盖后来重新生成的）
        for r in conn().execute("SELECT id, deep_json FROM items WHERE mindmap IS NULL AND deep_json IS NOT NULL"):
            try:
                mm = (json.loads(r["deep_json"]) or {}).get("mindmap") or ""
            except Exception:
                mm = ""
            if mm:
                conn().execute("UPDATE items SET mindmap=? WHERE id=?", (mm, r["id"]))
        # 文件夹表还是空的：把老版本的「分类」直接升格成文件夹，不调 AI、不花钱
        if conn().execute("SELECT COUNT(*) FROM folders").fetchone()[0] == 0:
            now = time.time()
            rows = conn().execute(
                "SELECT category, COUNT(*) n FROM items WHERE category IS NOT NULL AND category<>'' "
                "GROUP BY category ORDER BY MIN(id)").fetchall()
            for i, r in enumerate(rows):
                cur = conn().execute(
                    "INSERT OR IGNORE INTO folders(name,sort,seen_at,created_at) VALUES(?,?,?,?)",
                    (r["category"], i, now, now))
                if cur.lastrowid:
                    conn().execute("UPDATE items SET folder_id=? WHERE category=?",
                                   (cur.lastrowid, r["category"]))
        # 程序上次被强制关掉时，卡在中间状态的条目放回队列
        conn().execute(
            f"UPDATE items SET status='queued' WHERE status IN ({','.join('?' * len(ACTIVE))})", ACTIVE)
        conn().commit()


JSON_FIELDS = {"note": "note_json", "segments": "segments_json", "deep": "deep_json", "chat": "chat_json",
               "images": "images_json"}


def _row(r):
    if r is None:
        return None
    d = dict(r)
    for name, col in JSON_FIELDS.items():
        if col in d:
            d[name] = json.loads(d.pop(col) or "null")
    return d


def add(source, *, aweme_id=None, url=None, local_path=None, title=None, author=None,
        duration=None, cover=None):
    """新增一条；同一个视频（aweme_id 相同）不会重复添加。返回 (id, 是否新增)。"""
    now = time.time()
    with _write_lock:
        c = conn()
        if aweme_id:
            r = c.execute("SELECT id FROM items WHERE aweme_id=?", (aweme_id,)).fetchone()
            if r:
                return r["id"], False
        if local_path:
            r = c.execute("SELECT id FROM items WHERE local_path=?", (local_path,)).fetchone()
            if r:
                return r["id"], False
        cur = c.execute(
            "INSERT INTO items(source,aweme_id,url,local_path,title,author,duration,cover,status,created_at,updated_at)"
            " VALUES(?,?,?,?,?,?,?,?,'queued',?,?)",
            (source, aweme_id, url, local_path, title, author, duration, cover, now, now))
        c.commit()
        return cur.lastrowid, True


def update(item_id, **fields):
    if not fields:
        return
    for name, col in JSON_FIELDS.items():
        if name in fields:
            v = fields.pop(name)
            fields[col] = json.dumps(v, ensure_ascii=False) if v is not None else None
    fields["updated_at"] = time.time()
    keys = list(fields)
    with _write_lock:
        conn().execute(f"UPDATE items SET {','.join(k + '=?' for k in keys)} WHERE id=?",
                       [fields[k] for k in keys] + [item_id])
        conn().commit()


def get(item_id):
    return _row(conn().execute(
        "SELECT items.*, (SELECT name FROM folders WHERE id=items.folder_id) AS folder_name "
        "FROM items WHERE id=?", (item_id,)).fetchone())


def delete(item_id):
    with _write_lock:
        conn().execute("DELETE FROM items WHERE id=?", (item_id,))
        conn().commit()


def next_queued():
    return _row(conn().execute(
        "SELECT * FROM items WHERE status='queued' ORDER BY id LIMIT 1").fetchone())


def list_items(status=None, category=None, q=None, learned=None, starred=None, folder=None, limit=1000):
    sql = ("SELECT id,source,aweme_id,url,local_path,title,author,duration,cover,status,reason,category,learned,starred,"
           "folder_id,(SELECT name FROM folders WHERE id=items.folder_id) AS folder_name,"
           "created_at,updated_at,note_json,media_type,(deep_json IS NOT NULL) AS has_deep FROM items WHERE 1=1")
    args = []
    if status:
        statuses = status.split(",")
        sql += f" AND status IN ({','.join('?' * len(statuses))})"
        args += statuses
    if folder == "none":
        sql += " AND folder_id IS NULL"
    elif folder not in (None, "", "all"):
        sql += " AND folder_id=?"
        args.append(int(folder))
    if category:
        sql += " AND category=?"
        args.append(category)
    if learned is not None:
        sql += " AND learned=?"
        args.append(1 if learned else 0)
    if starred:
        sql += " AND starred=1"
    if q:
        like = f"%{q}%"
        sql += " AND (title LIKE ? OR author LIKE ? OR note_json LIKE ? OR transcript LIKE ? OR my_note LIKE ?)"
        args += [like] * 5
    sql += " ORDER BY id DESC LIMIT ?"
    args.append(limit)
    out = []
    for r in conn().execute(sql, args).fetchall():
        d = _row(r)
        note = d.pop("note") or {}
        d["summary"] = note.get("summary", "")
        d["note_title"] = note.get("title", "")
        d["tags"] = note.get("tags", [])
        d["difficulty"] = note.get("difficulty", "")
        out.append(d)
    return out


def stats():
    c = conn()
    by_status = {r["status"]: r["n"] for r in c.execute("SELECT status, COUNT(*) n FROM items GROUP BY status")}
    cats = [dict(r) for r in c.execute(
        "SELECT category, COUNT(*) n, SUM(learned) learned FROM items WHERE status='done' "
        "GROUP BY category ORDER BY n DESC")]
    learned = c.execute("SELECT COUNT(*) FROM items WHERE status='done' AND learned=1").fetchone()[0]
    starred = c.execute("SELECT COUNT(*) FROM items WHERE status='done' AND starred=1").fetchone()[0]
    return {"by_status": by_status, "categories": cats, "learned": learned, "starred": starred,
            "total": sum(by_status.values())}


# ------------------------------------------------------------------ 文件夹
def list_folders():
    """所有文件夹，带条数和「有没有新笔记」（比上次点开的时间新就亮小红点）。"""
    out = []
    for r in conn().execute(
            "SELECT f.id, f.name, f.sort, f.seen_at,"
            " (SELECT COUNT(*) FROM items WHERE folder_id=f.id AND status='done') AS n,"
            " (SELECT MAX(created_at) FROM items WHERE folder_id=f.id AND status='done') AS last_at"
            " FROM folders f ORDER BY f.sort, f.id"):
        d = dict(r)
        d["unread"] = bool(d["last_at"] and d["last_at"] > (d["seen_at"] or 0))
        d.pop("last_at", None)
        out.append(d)
    return out


def unclassified_count():
    return conn().execute(
        "SELECT COUNT(*) FROM items WHERE status='done' AND folder_id IS NULL").fetchone()[0]


def folder_add(name):
    """新建文件夹，返回 id；重名直接返回已有的 id。"""
    name = (name or "").strip()[:40]
    if not name:
        raise ValueError("文件夹名字不能为空")
    with _write_lock:
        c = conn()
        r = c.execute("SELECT id FROM folders WHERE name=?", (name,)).fetchone()
        if r:
            return r["id"], False
        nxt = (c.execute("SELECT COALESCE(MAX(sort),-1)+1 FROM folders").fetchone()[0])
        now = time.time()
        cur = c.execute("INSERT INTO folders(name,sort,seen_at,created_at) VALUES(?,?,?,?)",
                        (name, nxt, now, now))
        c.commit()
        return cur.lastrowid, True


def folder_rename(fid, name):
    name = (name or "").strip()[:40]
    if not name:
        raise ValueError("文件夹名字不能为空")
    with _write_lock:
        c = conn()
        dup = c.execute("SELECT id FROM folders WHERE name=? AND id<>?", (name, fid)).fetchone()
        if dup:
            raise ValueError("已经有同名文件夹了")
        c.execute("UPDATE folders SET name=? WHERE id=?", (name, fid))
        c.execute("UPDATE items SET category=? WHERE folder_id=?", (name, fid))
        c.commit()


def folder_delete(fid):
    """删文件夹，里面的笔记退回「待分类」（笔记和 MD 文件都不动）。返回退回的条数。"""
    with _write_lock:
        c = conn()
        n = c.execute("SELECT COUNT(*) FROM items WHERE folder_id=?", (fid,)).fetchone()[0]
        c.execute("UPDATE items SET folder_id=NULL, category='待分类' WHERE folder_id=?", (fid,))
        c.execute("DELETE FROM folders WHERE id=?", (fid,))
        c.commit()
        return n


def folder_reorder(ids):
    with _write_lock:
        c = conn()
        for i, fid in enumerate(ids):
            c.execute("UPDATE folders SET sort=? WHERE id=?", (i, int(fid)))
        c.commit()


def folder_seen(fid):
    with _write_lock:
        conn().execute("UPDATE folders SET seen_at=? WHERE id=?", (time.time(), fid))
        conn().commit()


def folder_id_by_name(name):
    """按名字找文件夹 id；找不到返回 None（调用方据此落到「待分类」）。"""
    name = (name or "").strip()
    if not name:
        return None
    r = conn().execute("SELECT id FROM folders WHERE name=?", (name,)).fetchone()
    return r["id"] if r else None


def move_to_folder(item_id, fid):
    """移动笔记；同时把 category 同步成文件夹名，导出的 MD 和旧界面才不会打架。"""
    with _write_lock:
        c = conn()
        name = "待分类"
        if fid:
            r = c.execute("SELECT name FROM folders WHERE id=?", (fid,)).fetchone()
            if not r:
                return
            name = r["name"]
        c.execute("UPDATE items SET folder_id=?, category=?, updated_at=? WHERE id=?",
                  (fid, name, time.time(), item_id))
        c.commit()


def classify_targets(limit=50):
    """待分类里已经有笔记的条目，供 AI 批量归类。"""
    return [_row(r) for r in conn().execute(
        "SELECT * FROM items WHERE status='done' AND folder_id IS NULL ORDER BY id LIMIT ?",
        (limit,)).fetchall()]
