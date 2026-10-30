"""AI 提炼：调用 OpenAI 兼容的 /chat/completions 接口，把文字稿变成结构化学习笔记。

只把文字稿发给你选的 AI 服务商；视频、音频、你的个人笔记都不会上传。
"""
import json
import re
import time
import urllib.error
import urllib.request

MAX_CHARS = 6000  # 文字稿太长就截断，控制花费

SYSTEM = """你是一位擅长把短视频内容整理成学习笔记的助手。你会收到一条抖音视频的语音转文字稿，或者一条抖音图文笔记的正文和图片里识别出的文字（都可能有错别字或断行，请按上下文理解），需要提炼成结构化笔记。

请严格只输出一个 JSON 对象，不要输出任何其他文字，格式如下：
{{
  "skip": false,
  "skip_reason": "",
  "title": "一句话说清这条视频讲了什么（20字以内，不要照抄原标题里的话题标签）",
  "folder": "从这些文件夹里选一个最归得进去的：{folders}；都不合适就填空字符串",
  "tags": ["3-5个关键词"],
  "difficulty": "入门 / 进阶 / 高级 选一个",
  "one_line": "一句话总结这条内容的结论（25 字以内，直接给结论）",
  "summary_md": "核心内容拆解（Markdown 正文，见下方排版规则）",
  "logic_md": "主线逻辑（Markdown 正文，按讲解顺序梳理，见下方排版规则）",
  "mindmap": "Markmap 格式的思维导图（用 # 和 - 写的纯文本，见下方规则）；实在整理不出来就填空字符串"
}}

规则：
- 只输出上面格式里列出的字段，不要额外增加字段。
- 如果视频是广告带货、短剧剧情、唱歌跳舞、纯娱乐闲聊，或几乎没有实质信息，返回 {{"skip": true, "skip_reason": "简短原因"}}。
- 不要编造视频里没有的信息；转写里明显听错的专有名词（比如工具名）可以按常识纠正。
- folder：只能从上面给的文件夹清单里原样挑一个（一字不差，包括标点）；确实没有一个合适就填空字符串 ""，不要自己造新名字。@@RULES@@

one_line / summary_md / logic_md 的写法：
- one_line：一句话把结论说透，25 字以内，不要「本条视频讲述了」「作者认为」这类铺垫，直接陈述观点。
- summary_md（核心内容拆解）：说清这条内容讲了什么、分成哪几块、每块的要点是什么。3-6 段。
- logic_md（主线逻辑）：按视频从头到尾的讲解顺序梳理行文思路——先从哪里切入、为什么这么讲、在哪里转折、最后落到什么结论。3-6 段。
- 排版：每个段落开头用两个全角空格「　　」；按语义拆成若干自然段，每段 2-5 句，禁止大段文字堆砌；段落之间用空行分隔。
- 格式标记（不要满篇标记，每段最多各一处）：
  **加粗** 用于段落的总起句、段落的收尾总结句；
  *斜体* 用于过渡、承接、转折类的衔接句；
  <mark>高亮</mark> 用于核心观点、行业现象、问题本质、专业关键定义。
- 返回 JSON 时段落用 \n 分隔，两个全角空格照常写在文本里。

mindmap 的写法（Markmap 格式的纯文本，不是图）：
- 用 Markdown 标题和列表搭结构：# 中心主题（一句话概括全片）、## 一级分支（3-6 个）、- 要点（不超过 25 字）、  - 细节（确实需要才展开）。
- 层级最多 4 层，总节点 12-30 个，宁可少而清，不要多而碎。
- 只写内容本身，不要代码块围栏、不要解释；段与段之间用 \n 分行。
- 这是本次输出里最后一块内容；导图和上面两块同等重要，不要为了凑字数把它砍成两层。

- 全部使用简体中文。"""

USER = """标题：{title}
作者：{author}
{label}：
{transcript}

请提炼成学习笔记。"""

RULES_ANCHOR = "@@RULES@@"   # SYSTEM 里的占位符，格式化之后再替换，免得用户写的花括号把它冲掉


def rules_block(rules):
    """把用户自己写的分类规则拼成提示词片段。没写就返回空字符串，提示词保持原样。"""
    text = (rules or "").strip()
    if not text:
        return ""
    return (
        "\n\n用户自己写的分类规则（用来理解每个文件夹到底收什么内容，判断 folder 时按这个来）：\n"
        + text[:1500]
        + "\n注意：上面只是想让你明白归类意图。folder 最终必须从文件夹清单里原样取一个名字，"
          "不要使用规则里提到、但清单里没有的名字。"
    )


class LLMError(Exception):
    def __init__(self, msg, retry=False):
        super().__init__(msg)
        self.retry = retry


def _post(url, headers, payload, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), method="POST",
                                 headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _as_cfg(c):
    """兼容传整份设置或已经整理好的模型配置。"""
    if "kind" in c:
        return c
    from .config import llm_cfg
    return llm_cfg(c, "main")


_QUIRKS = {}  # (接口地址, 模型) → 这个模型需要的参数调整，记住后下次直接用


def _apply_quirks(payload, key):
    q = _QUIRKS.get(key, set())
    if "mct" in q and "max_tokens" in payload:
        # 推理模型的输出上限也包含"思考"用的 token，给宽一点
        payload["max_completion_tokens"] = max(payload.pop("max_tokens") * 2, 4000)
    if "no_temp" in q:
        payload.pop("temperature", None)


def chat(cfg, messages, json_mode=True, temperature=0.3, max_tokens=None, timeout=120, retry_429=True):
    """返回 (文本, 消耗的 token 数)。带重试：网络/5xx 重试 2 次，429/529 限速等 5 秒。

    cfg 可以是整份设置，也可以是 config.llm_cfg() 的结果。
    """
    cfg = _as_cfg(cfg)
    key = (cfg.get("api_key") or "").strip()
    base = (cfg.get("base_url") or "").strip().rstrip("/")
    model = (cfg.get("model") or "").strip()
    if not key:
        raise LLMError("还没填 AI 的 API Key")
    if not base or not model:
        raise LLMError("请在设置里填好接口地址和模型名")

    if cfg.get("kind") == "anthropic":
        # Claude 原生接口：system 单独传；没有 JSON 模式，靠提示词约束 + parse_json 兜底
        if base.endswith("/v1"):
            base = base[:-3]
        url = base + "/v1/messages"
        headers = {"x-api-key": key, "anthropic-version": "2023-06-01"}
        system = "\n\n".join(m["content"] for m in messages if m["role"] == "system")
        msgs = [m for m in messages if m["role"] != "system"]
        payload = {"model": model, "max_tokens": max_tokens or 4096, "messages": msgs, "temperature": temperature}
        if system:
            payload["system"] = system
    else:
        url = base + "/chat/completions"
        headers = {"Authorization": f"Bearer {key}"}
        payload = {"model": model, "messages": messages, "temperature": temperature, "stream": False}
        if max_tokens:
            payload["max_tokens"] = max_tokens
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        _apply_quirks(payload, (base, model))

    attempt = 0
    while True:
        attempt += 1
        try:
            data = _post(url, headers, payload, timeout=timeout)
            if cfg.get("kind") == "anthropic":
                text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
                u = data.get("usage") or {}
                used = (u.get("input_tokens") or 0) + (u.get("output_tokens") or 0)
                if data.get("stop_reason") == "max_tokens" and json_mode:
                    raise LLMError("AI 输出太长被截断了，可以在设置里把精读分段字数调小再试")
            else:
                text = data["choices"][0]["message"]["content"] or ""
                used = (data.get("usage") or {}).get("total_tokens", 0)
            return text, used
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", "ignore")[:300]
            except Exception:
                pass
            if e.code == 401:
                raise LLMError("API Key 无效（401），请到设置里检查")
            if e.code in (402, 403):
                raise LLMError(f"账户余额不足或没有权限（{e.code}），请到服务商后台检查：{body}")
            if e.code == 404:
                raise LLMError(f"接口地址或模型名不对（404）：{body}")
            low = body.lower()
            qk = (base, model)
            # OpenAI 新一代（推理）模型：max_tokens 改名 max_completion_tokens
            if e.code == 400 and "max_completion_tokens" in low and "max_tokens" in payload:
                _QUIRKS.setdefault(qk, set()).add("mct")
                _apply_quirks(payload, qk)
                continue
            # 有的模型只允许默认 temperature
            if e.code == 400 and "temperature" in low and "temperature" in payload:
                _QUIRKS.setdefault(qk, set()).add("no_temp")
                payload.pop("temperature", None)
                continue
            if e.code == 400 and (payload.get("max_tokens") or 0) > 4096 and "token" in low:
                payload["max_tokens"] = 4096  # 免费模型通常限制单次最多输出 4096 tokens
                continue
            if e.code == 400 and "response_format" in payload:
                payload.pop("response_format")  # 有的模型不支持 JSON 模式，去掉再试
                continue
            if e.code in (429, 529) and attempt <= 3 and retry_429:
                time.sleep(5 * attempt)
                continue
            if e.code >= 500 and attempt <= 2:
                time.sleep(2)
                continue
            if e.code == 429:
                raise LLMError("请求太频繁或免费额度用完了（429）。免费额度一般按天/按月恢复；"
                               "着急的话可以在设置里换成付费模型。", retry=True)
            raise LLMError(f"AI 接口报错（HTTP {e.code}）：{body}", retry=e.code >= 500)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if attempt <= 2:
                time.sleep(2)
                continue
            raise LLMError(f"连不上 AI 接口：{getattr(e, 'reason', e)}", retry=True)
        except (KeyError, IndexError, ValueError) as e:
            raise LLMError(f"AI 接口返回的格式看不懂：{e}")


def parse_json(text: str) -> dict:
    t = (text or "").strip()
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t)
    try:
        return json.loads(t)
    except Exception:
        a, b = t.find("{"), t.rfind("}")
        if a >= 0 and b > a:
            return json.loads(t[a:b + 1])
        raise


def _str_list(v):
    if isinstance(v, str):
        v = [v]
    return [str(x).strip() for x in (v or []) if str(x).strip()]


def _obj_list(v, keys):
    out = []
    for x in v or []:
        if isinstance(x, dict):
            d = {k: str(x.get(k, "")).strip() for k in keys}
            if d[keys[0]]:
                out.append(d)
        elif isinstance(x, str) and x.strip():
            out.append({keys[0]: x.strip(), keys[1]: ""})
    return out


def normalize(d: dict) -> dict:
    """统一字段格式，校验不过就抛错。"""
    if d.get("skip") is True:
        return {"skip": True, "skip_reason": str(d.get("skip_reason") or "没有实质内容")}
    note = {
        "skip": False,
        "relevant": d.get("relevant") is not False,
        "title": str(d.get("title") or "").strip(),
        "category": str(d.get("folder") or d.get("category") or "待分类").strip() or "待分类",
        "folder": str(d.get("folder") or "").strip(),
        "tags": _str_list(d.get("tags"))[:6],
        "difficulty": str(d.get("difficulty") or "").strip(),
        "summary": str(d.get("summary") or "").strip(),
        "one_line": str(d.get("one_line") or "").strip(),
        "summary_md": str(d.get("summary_md") or "").strip(),
        "logic_md": str(d.get("logic_md") or "").strip(),
        # 下面几项是旧版字段：新提示词已经不生成，这里保留解析只为兼容老笔记/别的接口，
        # 界面上只在 summary_md 为空时才拿来兜底。
        "points": _str_list(d.get("points")),
        "steps": _str_list(d.get("steps")),
        "tools": _obj_list(d.get("tools"), ["name", "use"]),
        "concepts": _obj_list(d.get("concepts"), ["term", "explain"]),
        "quiz": _obj_list(d.get("quiz"), ["q", "a"]),
        "mindmap": str(d.get("mindmap") or "").strip(),
    }
    # 模型偶尔会把导图裹进代码块，或者返回空；格式不对就当没生成，不连累整条笔记
    if note["mindmap"].startswith("```"):
        note["mindmap"] = note["mindmap"].split("\n", 1)[1] if "\n" in note["mindmap"] else ""
        note["mindmap"] = note["mindmap"].rsplit("```", 1)[0].strip()
    if "#" not in note["mindmap"]:
        note["mindmap"] = ""
    if not (note["summary_md"] or note["logic_md"]):
        raise LLMError("AI 返回的笔记正文为空")
    if not note["title"]:
        head = (note["one_line"] or note["summary_md"] or note["logic_md"]).strip()
        note["title"] = (re.split(r"[。！？!?\n]", head)[0].strip() or "未命名")[:30]
    return note


def extract(settings, title, author, transcript, kind="video", folders=None):
    """返回 (笔记 dict, token 数)。folders 是用户建的文件夹名清单，给 AI 归类用。"""
    names = [f for f in (folders or []) if f]
    flist = "、".join(names) if names else "（用户还没建文件夹，一律填空字符串）"
    sys_prompt = SYSTEM.format(folders=flist).replace(RULES_ANCHOR, rules_block(settings.get("folder_rules")))
    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": USER.format(
            title=title or "（无）", author=author or "（未知）",
            label="图文笔记的正文和图片文字（【图N】是第 N 张图里识别出的文字）" if kind == "note" else "语音转文字稿",
            transcript=(transcript or "")[:MAX_CHARS])},
    ]
    text, used = chat(settings, messages, max_tokens=8000)
    try:
        d = parse_json(text)
    except Exception:
        raise LLMError("AI 返回的不是有效的 JSON：" + (text or "")[:200])
    return normalize(d), used


CLASSIFY_SYSTEM = """你是资料整理助手。用户会给你一个文件夹清单，和一条笔记的标题与摘要，判断这条笔记最该放进哪个文件夹。

只输出一个 JSON 对象，不要任何其他文字：{"folder": "文件夹名"}
- folder 必须是清单里的名字，一个字都不能改；实在没有一个合适，就填 {"folder": ""}。
- 不要自造新名字，不要解释理由。"""


def classify(settings, folders, title, summary):
    """给已有笔记判一个文件夹。返回 (文件夹名 或 "", token 数)。"""
    names = [f for f in (folders or []) if f]
    if not names:
        raise LLMError("还没有文件夹，先建几个再归类")
    sys_prompt = (CLASSIFY_SYSTEM + "\n\n文件夹清单：" + "、".join(names)
                  + rules_block(settings.get("folder_rules")))
    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": f"标题：{title or '（无）'}\n摘要：{(summary or '')[:600]}"},
    ]
    out, used = chat(settings, messages, temperature=0, max_tokens=300)
    try:
        name = str(parse_json(out).get("folder") or "").strip()
    except Exception:
        return "", used
    return (name if name in names else ""), used


JUDGE_SYSTEM = """你是内容筛选助手。用户会给你两列清单，和一条抖音内容的基本信息，你要判断这条内容要不要转成文字笔记。

规则（按顺序执行）：
1. 只要符合「不要纳入」里的任何一条，就判为不纳入，即使它同时符合「要纳入」。
2. 「要纳入」不为空时：符合其中一条才算纳入；一条都不符合，同样判为不纳入。
3. 「要纳入」为空时：除了规则 1，一律纳入。
4. 信息不足、拿不准、判断不了，一律判为纳入（宁可多做，不要漏内容）。
5. 只看内容本身讲什么。标题党、只有口号或一堆话题标签、看不出内容却说得很夸张的，按纳入处理，不要凭一个标签下结论。

只输出一个 JSON 对象，不要解释过程：{"keep": true, "why": "游戏实况"}
- keep 只能是 true 或 false。
- why 是给用户看的一句话归类，12 字以内，像「游戏实况」「影视解说」「AI 工具实操」；判为纳入时可以写内容主题，也可以留空字符串。"""


def _topic_lines(text):
    """把用户填的多行主题拆成清单，去掉前面的短横线、序号。"""
    out = []
    for ln in str(text or "").splitlines():
        ln = ln.strip()
        ln = re.sub(r"^[-*·•]+\s*", "", ln)
        ln = re.sub(r"^\d+[.、)）]\s*", "", ln)
        if ln:
            out.append(ln[:60])
    return out[:40]


def judge_topic(settings, title, author="", duration=0, kind="video", desc=""):
    """先判：这条内容要不要转成笔记。返回 (keep, why, 消耗的 token)。

    两列都空时不做判断、不花钱，直接按纳入处理。
    注意这里不用 .format()：用户填的主题里可能有花括号，拼字符串最稳。
    """
    inc = _topic_lines(settings.get("topic_include"))
    exc = _topic_lines(settings.get("topic_exclude"))
    if not inc and not exc:
        return True, "", 0
    blocks = [
        "【要纳入的主题】\n" + ("\n".join("- " + x for x in inc) if inc else "（没填，表示不限制）"),
        "【不要纳入的主题】\n" + ("\n".join("- " + x for x in exc) if exc else "（没填）"),
    ]
    info = ["【内容】",
            "类型：" + ("图文" if kind == "note" else "视频"),
            "标题：" + ((title or "（无标题）")[:200]),
            "作者：" + (author or "（未知）")]
    if duration:
        info.append(f"时长：{int(round(duration))} 秒")
    tail = (desc or "").strip()
    if tail and tail != (title or "").strip():
        info.append("简介：" + tail[:300])
    messages = [
        {"role": "system", "content": JUDGE_SYSTEM},
        {"role": "user", "content": "\n\n".join(blocks + ["\n".join(info)])},
    ]
    out, used = chat(settings, messages, temperature=0, max_tokens=120)
    try:
        j = parse_json(out)
    except Exception:
        return True, "", used   # 解析不出来就当纳入，别丢内容
    keep = j.get("keep")
    why = str(j.get("why") or "").strip()[:20]
    if not isinstance(keep, bool):
        return True, why, used
    return keep, why, used


MINDMAP_SYSTEM = """你是知识整理助手。把用户给的视频文字稿整理成一张思维导图，用 Markmap 的 Markdown 格式输出。

格式：
# 中心主题（一句话概括全片）
## 一级分支（3-6 个）
- 要点（尽量短，不超过 25 字）
  - 细节（确实需要才展开）

规则：
- 只输出 Markdown 本体，不要代码块围栏、不要解释、不要前言。
- 层级最多 4 层，总节点控制在 12-30 个。
- 忠于文字稿的原意，不要编造；明显听错的专有名词可按常识纠正。
- 全部使用简体中文。"""


def make_mindmap(settings, title, transcript):
    """按文字稿生成 Markmap 文本。返回 (markdown, token 数)。"""
    text = (transcript or "").strip()
    if not text:
        raise LLMError("这条还没有文字稿，没法生成思维导图")
    messages = [
        {"role": "system", "content": MINDMAP_SYSTEM},
        {"role": "user", "content": f"标题：{title or '（无）'}\n\n文字稿：\n{text[:MAX_CHARS]}"},
    ]
    out, used = chat(settings, messages, json_mode=False, temperature=0.4, timeout=240)
    md = (out or "").strip()
    if md.startswith("```"):  # 模型偶尔会裹一层代码块
        md = md.split("\n", 1)[1] if "\n" in md else md
        md = md.rsplit("```", 1)[0]
    md = md.strip()
    if not md or "#" not in md:
        raise LLMError("模型没有返回有效的思维导图内容，可以再试一次")
    return md, used


CHAT_HINT = ("gpt", "o1", "o3", "o4", "chatgpt", "claude", "deepseek", "qwen", "glm", "moonshot", "kimi",
             "yi-", "llama", "mistral", "gemini", "doubao", "ernie", "hunyuan", "minimax", "abab", "step")
SKIP_HINT = ("embed", "whisper", "tts", "dall-e", "image", "audio", "realtime", "moderation", "transcribe",
             "search", "rerank", "vision-preview", "babbage", "davinci", "sora", "speech")


def list_models(cfg):
    """向服务商要可用模型列表，返回模型 ID 列表（尽量只留聊天模型）。"""
    cfg = _as_cfg(cfg)
    key = (cfg.get("api_key") or "").strip()
    base = (cfg.get("base_url") or "").strip().rstrip("/")
    if not key or not base:
        raise LLMError("先填好接口地址和 API Key")
    if cfg.get("kind") == "anthropic":
        if base.endswith("/v1"):
            base = base[:-3]
        url, headers = base + "/v1/models?limit=100", {"x-api-key": key, "anthropic-version": "2023-06-01"}
    else:
        url, headers = base + "/models", {"Authorization": f"Bearer {key}"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise LLMError(f"这个服务商不支持读取模型列表（HTTP {e.code}），请手动填写模型名")
    except Exception as e:
        raise LLMError(f"读取模型列表失败：{e}")
    ids = [str(m.get("id")) for m in (data.get("data") or data.get("models") or []) if isinstance(m, dict) and m.get("id")]
    chat_ids = [i for i in ids if not any(h in i.lower() for h in SKIP_HINT)]
    pref = [i for i in chat_ids if any(h in i.lower() for h in CHAT_HINT)]
    out = pref or chat_ids or ids
    return sorted(set(out), key=lambda x: (x.count("-") > 4, x))


def test(cfg, retry_429=True):
    text, _ = chat(cfg, [{"role": "user", "content": "请只回复两个字：你好"}], json_mode=False, temperature=0,
                   max_tokens=300, retry_429=retry_429)
    return text.strip()[:50] or "（连接正常）"


def free_setup(plan, api_key, log=lambda m: None):
    """免费方案一键配置：读模型列表 → 挑免费模型 → 逐个测试，返回 (能用的模型, 试过的列表)。"""
    from .config import FREE_PLANS
    p = FREE_PLANS[plan]
    cfg = {"provider": p["provider"], "base_url": p["base_url"], "api_key": api_key.strip(), "kind": "openai"}
    listed = []
    try:
        listed = [m.split("/", 1)[1] if m.startswith("models/") else m for m in list_models(cfg)]
    except LLMError:
        pass
    cands = [m for m in p["models"] if not listed or m in listed]
    if listed and p.get("pick"):
        extra = [m for m in listed if all(k in m.lower() for k in p["pick"])
                 and not any(a in m.lower() for a in p["avoid"]) and m not in cands]
        extra.sort(reverse=True)  # 版本号大的通常更新
        cands += extra
    if not cands:
        cands = list(p["models"])
    tried = []
    for m in cands[:5]:
        cfg["model"] = m
        try:
            test(cfg, retry_429=False)
            return m, tried
        except LLMError as e:
            msg = str(e)
            tried.append(f"{m}：{msg[:80]}")
            if "401" in msg or "无效" in msg:
                raise LLMError("这个 Key 无效，请检查有没有复制完整（前后不要有空格）")
            if "429" in msg:
                raise LLMError("Key 是有效的，但现在请求太频繁或免费额度用完了（429）。过一会儿再点一键配置试试。")
    raise LLMError("没有找到能用的免费模型：" + "；".join(tried[:3]))
