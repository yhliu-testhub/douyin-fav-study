"""删文件尽量走系统回收站，实在不行才真删。

用户点「删除笔记并删视频」时调用；回收站里还能还原，比直接 unlink 稳妥。
"""
from __future__ import annotations

import ctypes
import platform
import subprocess
from ctypes import wintypes
from pathlib import Path


# ---------------------------------------------------------------- Windows
class _SHFILEOPSTRUCTW(ctypes.Structure):
    _fields_ = [
        ("hwnd", wintypes.HWND),
        ("wFunc", wintypes.UINT),
        ("pFrom", wintypes.LPCWSTR),
        ("pTo", wintypes.LPCWSTR),
        ("fFlags", ctypes.c_uint16),
        ("fAnyOperationsAborted", wintypes.BOOL),
        ("hNameMappings", ctypes.c_void_p),
        ("lpszProgressTitle", wintypes.LPCWSTR),
    ]


def _win_trash(p: Path) -> bool:
    FO_DELETE = 3
    FOF_SILENT = 0x0004
    FOF_NOCONFIRMATION = 0x0010
    FOF_ALLOWUNDO = 0x0040          # 关键：进回收站而不是永久删
    FOF_NOERRORUI = 0x0400
    op = _SHFILEOPSTRUCTW()
    op.hwnd = None
    op.wFunc = FO_DELETE
    # SHFileOperation 要求路径以双 \0 结尾；ctypes 传 str 会自动补一个，这里再补一个
    op.pFrom = str(p) + "\0"
    op.pTo = None
    op.fFlags = FOF_SILENT | FOF_NOCONFIRMATION | FOF_ALLOWUNDO | FOF_NOERRORUI
    rc = ctypes.windll.shell32.SHFileOperationW(ctypes.byref(op))
    return rc == 0 and not p.exists()


# ---------------------------------------------------------------- macOS
def _mac_trash(p: Path) -> bool:
    script = 'tell application "Finder" to delete POSIX file "%s"' % str(p).replace('"', '\\"')
    r = subprocess.run(["osascript", "-e", script], capture_output=True, timeout=20)
    return r.returncode == 0 and not p.exists()


# ---------------------------------------------------------------- Linux
def _linux_trash(p: Path) -> bool:
    for cmd in (["gio", "trash", str(p)], ["trash-put", str(p)]):
        try:
            r = subprocess.run(cmd, capture_output=True, timeout=20)
        except Exception:
            continue
        if r.returncode == 0 and not p.exists():
            return True
    return False


def delete(p) -> tuple[bool, str]:
    """删一个文件。返回 (成功?, 说明)，说明给界面直接显示。"""
    f = Path(p)
    if not f.exists():
        return False, "文件已经不在了"
    if f.is_dir():
        return False, "这是个文件夹，不处理"
    ok = False
    try:
        sysname = platform.system()
        if sysname == "Windows":
            ok = _win_trash(f)
        elif sysname == "Darwin":
            ok = _mac_trash(f)
        else:
            ok = _linux_trash(f)
    except Exception:
        ok = False
    if ok:
        return True, "已移到回收站"
    try:  # 回收站用不了（比如网络盘、权限问题）再真删
        f.unlink()
        return True, "已删除"
    except Exception as e:
        return False, f"删除失败：{e}"
