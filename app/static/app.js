/* 收藏学习台 前端（原生 JS，不需要编译） */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = $("#view");

/* ---------------------------------------------------------------- 线条图标（Lucide 风格，ISC 开源协议） */
const ICONS = {
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  play: '<path d="M6 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 6 3.5z" fill="currentColor" stroke="none"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  starFill: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" fill="currentColor"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
  cap: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  retry: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  folder: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
};
const ico = (name, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

/* ---------------------------------------------------------------- 分类配色（Radix Colors 色阶） */
const CAT_PALETTE = ["blue", "orange", "violet", "pink", "green", "indigo", "amber", "teal", "cyan", "red"];
const CAT_FIXED = {
  "AI 工具推荐": "blue", "提示词技巧": "orange", "AI 编程": "violet", "AI 绘画与视频": "pink", "AI 办公效率": "green",
  "大模型与行业资讯": "indigo", "AI 副业与变现": "amber", "AI 学习方法": "teal", "其他": "gray", "未分类": "gray",
};
function catColor(name) {
  name = name || "其他";
  if (CAT_FIXED[name]) return CAT_FIXED[name];
  let h = 0; for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return CAT_PALETTE[h % CAT_PALETTE.length];
}
const catChip = (name, extra = "") => `<span class="chip cat cat-${catColor(name)} ${extra}">${esc(name || "其他")}</span>`;

const STATUS = {
  queued: ["排队中", "gray"], fetching: ["读取信息", "teal"], downloading: ["下载中", "teal"],
  transcribing: ["转文字中", "teal"], extracting: ["AI 提炼中", "teal"], done: ["已完成", "teal"],
  need_key: ["待提炼", "warn"], irrelevant: ["主题无关", "gray"], skipped: ["已跳过", "gray"], failed: ["失败", "bad"],
};
const ACTIVE = ["queued", "fetching", "downloading", "transcribing", "extracting"];

let STATE = null;
const savedLib = (() => {
  try { return JSON.parse(localStorage.getItem("libView") || "{}") || {}; } catch { return {}; }
})();
let libFilter = {
  q: "", learned: "", starred: "", folder: "",
  view: savedLib.view === "list" ? "list" : "card",
  sort: savedLib.sort || "date",
  desc: savedLib.desc !== undefined ? !!savedLib.desc : true,
};
function saveLibView() {
  try { localStorage.setItem("libView", JSON.stringify({ view: libFilter.view, sort: libFilter.sort, desc: libFilter.desc })); } catch {}
}
let procTab = "active";
let lastItems = [];

async function api(path, body) {
  const opt = body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  const r = await fetch(path, opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `请求失败 ${r.status}`);
  return j;
}

function toast(msg, ms = 2600) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms);
}

const fmtDur = (s) => { s = Math.round(s || 0); return s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : ""; };
const fmtTime = (t) => new Date(t * 1000).toLocaleTimeString("zh-CN", { hour12: false });
const fmtDate = (t) => (t ? new Date(t * 1000).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }) : "");
const prettyUrl = (u) => {
  try {
    const x = new URL(u);
    const p = x.pathname.replace(/\/$/, "");
    return (x.hostname.replace(/^www\./, "") + p).slice(0, 46);
  } catch { return u || ""; }
};

/* ---------------------------------------------------------------- 状态轮询 */
async function refreshState() {
  try { STATE = await api("/api/state"); } catch { return; }
  const st = STATE.stats, w = STATE.worker;
  const queued = ACTIVE.reduce((n, k) => n + (st.by_status[k] || 0), 0);
  const q = $("#navQueue"); q.hidden = !queued; q.textContent = queued;
  const sf = $("#sideStatus");
  const pg = STATE.progress || {}, dp = STATE.deep || {};
  const parts = [];
  if (w.busy) parts.push(pg.item_id ? `${pg.stage_label} ${pg.pct}% · ${fmtEta(pg.eta)}` : (w.stage || "处理中…"));
  if (dp.item_id) parts.push(`精读 ${dp.pct || 0}% · ${fmtEta(dp.eta)}`);
  sf.className = "side-foot" + (parts.length ? " busy" : "");
  sf.textContent = parts.join("\n") || `就绪 · v${STATE.version || ""}`;
  renderNavFolders();
  return STATE;
}

/* ---------------------------------------------------------------- 侧边栏文件夹 */
let dragPayload = null;   // {type:"item"|"folder", id}
let renamingId = null;    // 正在改名的文件夹 id（编辑中不重建侧栏，否则输入框会被冲掉）

function renderNavFolders() {
  const el = $("#navFolders");
  if (!el || dragPayload || renamingId) return;  // 正在拖东西/改名时别重建侧栏，会打断当前操作
  const fs = STATE.folders || [];
  const un = STATE.unclassified || 0;
  el.innerHTML = `
    <div class="fhead"><span>文件夹</span><button class="icon sm" id="newFolderBtn" title="新建文件夹">＋</button></div>
    <a class="fitem ${libFilter.folder === "none" ? "on" : ""}" href="#/library/u" data-fid="none"
       title="AI 没拿准的都会先放这里">
      <i class="dot" style="background:var(--ink-4)"></i><span class="fname">待分类</span><span class="fcount">${un}</span>
    </a>
    ${fs.map((f) => `
      <a class="fitem ${String(libFilter.folder) === String(f.id) ? "on" : ""}" href="#/library/f/${f.id}"
         data-fid="${f.id}" draggable="true" title="${esc(f.name)}">
        <i class="dot cat-${catColor(f.name)}"></i><span class="fname" title="双击可改名">${esc(f.name)}</span>
        ${f.unread ? `<i class="ndot" title="有新笔记"></i>` : ""}
        <span class="fcount">${f.n}</span>
        <span class="fops">
          <button class="fren-btn" data-ren="${f.id}" title="重命名">✎</button>
          <button class="fdel" data-del="${f.id}" title="删除文件夹">✕</button>
        </span>
      </a>`).join("")}
    ${fs.length ? "" : `<div class="fhint">还没有文件夹，点上面的 ＋ 建一个</div>`}`;
  bindFolders();
}

function bindFolders() {
  const nf = $("#newFolderBtn");
  if (nf) nf.onclick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const name = (prompt("新文件夹的名字：") || "").trim();
    if (!name) return;
    try {
      const r = await api("/api/folders", { name });
      toast(r.new ? `已建「${name}」` : `「${name}」已存在`);
      await refreshState();
    } catch (err) { toast(err.message); }
  };
  $$("#navFolders .fren-btn").forEach((b) => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    startRenameFolder(b.dataset.ren);
  });
  $$("#navFolders .fitem .fname").forEach((n) => n.ondblclick = (e) => {
    const a = n.closest(".fitem");
    if (!a || a.dataset.fid === "none") return;
    e.preventDefault(); e.stopPropagation();
    startRenameFolder(a.dataset.fid);
  });
  $$("#navFolders .fdel").forEach((b) => b.onclick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const fid = b.dataset.del;
    const f = (STATE.folders || []).find((x) => String(x.id) === String(fid));
    if (!f) return;
    if (!confirm(`删除文件夹「${f.name}」？\n里面的 ${f.n} 条笔记会回到「待分类」，笔记和文件都不会删。`)) return;
    await api(`/api/folders/${fid}`, { action: "delete" });
    toast("文件夹已删除，笔记回到待分类");
    if (String(libFilter.folder) === String(fid)) location.hash = "#/library";
    await refreshState();
    if (route().name === "library") renderLibrary(true);
  });
  $$("#navFolders .fitem").forEach((a) => {
    const fid = a.dataset.fid;
    if (fid !== "none") {
      a.addEventListener("dragstart", (e) => {
        dragPayload = { type: "folder", id: fid };
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", "folder:" + fid); } catch {}
        a.classList.add("dragging");
      });
      a.addEventListener("dragend", () => { a.classList.remove("dragging"); dragPayload = null; });
    }
    a.addEventListener("dragover", (e) => {
      if (!dragPayload) return;
      if (dragPayload.type === "folder" && (fid === "none" || dragPayload.id === fid)) return;
      e.preventDefault();
      a.classList.add("drop-on");
    });
    a.addEventListener("dragleave", () => a.classList.remove("drop-on"));
    a.addEventListener("drop", async (e) => {
      e.preventDefault(); a.classList.remove("drop-on");
      const p = dragPayload; dragPayload = null;
      if (!p) return;
      if (p.type === "item") return moveItemToFolder(p.id, fid);
      if (fid !== "none") return reorderFolder(p.id, fid);
    });
  });
}

/* 文件夹改名：把名字就地换成一个输入框，回车保存、Esc 取消、点到别处也算保存 */
async function startRenameFolder(fid) {
  const f = (STATE.folders || []).find((x) => String(x.id) === String(fid));
  if (!f || renamingId) return;
  const a = $(`#navFolders .fitem[data-fid="${fid}"]`);
  const span = a && a.querySelector(".fname");
  if (!span) return;
  renamingId = fid;
  a.setAttribute("draggable", "false");   // 改名时别让它还能被拖动
  a.classList.add("editing");
  const inp = document.createElement("input");
  inp.className = "fren";
  inp.type = "text";
  inp.maxLength = 40;
  inp.value = f.name;
  span.replaceWith(inp);
  inp.focus();
  inp.select();
  let done = false;
  const finish = async (save) => {
    if (done) return;
    done = true;
    const v = (inp.value || "").trim();
    renamingId = null;
    if (!save || !v || v === f.name) { await refreshState(); return; }
    try {
      await api(`/api/folders/${fid}`, { action: "rename", name: v });
      toast(`已改名为「${v}」`);
    } catch (err) { toast(err.message); }
    await refreshState();
    // 页面上其他位置（标题、卡片标签、详情页下拉）也可能写着旧名字，一并重画
    const r = route();
    if (r.name === "library") renderLibrary();
    else if (r.name === "item") renderItem(r.id, r.tab);
  };
  inp.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); finish(true); }
    else if (e.key === "Escape") { e.preventDefault(); finish(false); }
  };
  inp.onblur = () => finish(true);
  inp.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
  inp.ondblclick = (e) => e.stopPropagation();
  inp.onmousedown = (e) => e.stopPropagation();
}

async function moveItemToFolder(id, fid) {
  try {
    await api(`/api/items/${id}/action`, { action: "folder", value: fid === "none" ? null : +fid });
    const f = (STATE.folders || []).find((x) => String(x.id) === String(fid));
    toast(fid === "none" ? "已移到「待分类」" : `已移入「${f ? f.name : "文件夹"}」`);
    await refreshState();
    if (route().name === "library") renderLibrary(true);
  } catch (e) { toast(e.message); }
}

async function reorderFolder(moveId, targetId) {
  const ids = (STATE.folders || []).map((f) => String(f.id));
  const from = ids.indexOf(String(moveId));
  if (from < 0) return;
  ids.splice(from, 1);
  const to = ids.indexOf(String(targetId));
  ids.splice(to < 0 ? ids.length : to, 0, String(moveId));
  await api("/api/folders/reorder", { ids: ids.map(Number) });
  await refreshState();
}

let pollTimer = null;
let wasDeepBusy = false;
function startPolling() {
  clearTimeout(pollTimer);
  const tick = async () => {
    const before = JSON.stringify(STATE?.stats);
    await refreshState();
    const r = route();
    if (r.name === "process") renderProcessLive();
    else if (r.name === "library" && !dragPayload && JSON.stringify(STATE?.stats) !== before) renderLibrary(true);
    else if (r.name === "item" && curItem && curItem.id === r.id) {
      // 详情页只关心后台处理进度，精读已移除
    }
    const active = STATE?.worker?.busy || STATE?.deep?.item_id;
    pollTimer = setTimeout(tick, active ? 1000 : 2500);
  };
  pollTimer = setTimeout(tick, 1000);
}

/* ---------------------------------------------------------------- 路由 */
function route() {
  const h = decodeURIComponent(location.hash.slice(1) || "/library");
  const p = h.split("/").filter(Boolean);
  if (p[0] === "item") return { name: "item", id: +p[1], tab: p[2] };
  if (p[0] === "process") return { name: "process" };
  if (p[0] === "settings") return { name: "settings" };
  let folder = "";
  if (p[1] === "u") folder = "none";
  else if (p[1] === "f") folder = p[2] || "";
  else if (p[1] === "cat") {  // 老链接兼容：按名字找文件夹
    const name = p.slice(2).join("/");
    const f = (STATE?.folders || []).find((x) => x.name === name);
    folder = f ? String(f.id) : "";
  }
  return { name: "library", folder };
}

async function render() {
  const r = route();
  $$(".nav > a").forEach((a) => a.classList.toggle("on", a.dataset.nav === (r.name === "item" ? "library" : r.name)));
  if (!STATE) await refreshState();
  if (r.name === "library") { libFilter.folder = r.folder; await refreshState(); return renderLibrary(); }
  if (r.name === "item") return renderItem(r.id, r.tab);
  if (r.name === "process") return renderProcess();
  if (r.name === "settings") return renderSettings();
}
window.addEventListener("hashchange", () => {
  window.scrollTo(0, 0);
  view.classList.remove("fade-in"); void view.offsetWidth; view.classList.add("fade-in");
  render();
});

/* ---------------------------------------------------------------- 收藏库 */
function depsBanner() {
  const d = STATE.deps; if (!d) return "";
  const miss = [];
  if (!d.playwright) miss.push("读取抖音的组件（playwright）：粘贴链接和同步收藏夹都用不了");
  if (!d.asr) miss.push("语音转文字的组件：没有字幕的视频转不了文字");
  if (!miss.length) return "";
  return `<div class="banner warn"><div><b>安装没有完成，缺少：</b><br>${miss.map(esc).join("<br>")}
    <div class="small" style="margin-top:6px">${d.python_ok ? "" : `你用的是 Python ${esc(d.python)}，太新了，部分组件还不支持。请先安装 Python 3.12，`}关掉这个程序，删掉程序文件夹里的 .venv 文件夹，再重新运行安装脚本，看到「安装完成」后再启动。</div></div></div>`;
}

function bannerHtml() {
  const dep = depsBanner(); if (dep) return dep;
  const s = STATE.settings;
  if (!s.api_key_set) return `<div class="banner info"><div><b>还没配置 AI。</b> 没有它只能把视频转成文字，生成不了笔记。
    用「免费方案」两分钟就能配好，不花钱。</div><span class="spacer"></span><a class="btn sm primary" href="#/settings">去配置 →</a></div>`;
  return "";
}

async function renderLibrary(soft = false) {
  const params = new URLSearchParams({ status: "done" });
  if (libFilter.q) params.set("q", libFilter.q);
  if (libFilter.starred) params.set("starred", "1");
  if (libFilter.folder) params.set("folder", libFilter.folder);
  if (!soft && !$("#libGrid")) view.innerHTML = skeletonLibrary();
  const items = sortItems(await api("/api/items?" + params));
  lastItems = items;

  const curF = (STATE.folders || []).find((f) => String(f.id) === String(libFilter.folder));
  const isPending = libFilter.folder === "none";

  if (soft && $("#libGrid")) {
    const g = $("#libGrid");
    g.className = libFilter.view === "list" ? "" : "grid";
    g.innerHTML = bodyHtml(items); bindLibrary(); return;
  }

  view.innerHTML = `
    ${bannerHtml()}
    <div class="head">
      <div><h1>${curF ? `<i class="dot big-dot cat-${catColor(curF.name)}"></i>${esc(curF.name)}`
        : isPending ? "待分类" : "收藏库"}</h1>
      ${libFilter.folder ? `<div class="muted"><a href="#/library">← 全部笔记</a></div>`
        : ""}</div>
      <div class="spacer"></div>
      ${isPending ? `<button class="btn" id="classifyBtn" title="把这里的笔记逐条交给 AI 判文件夹">${ico("sparkles")}AI 自动归类</button>` : ""}
      <button class="btn" id="randBtn" title="随机打开一条">${ico("shuffle")}随机看一条</button>
      <button class="btn primary" id="addBtn">${ico("plus")}添加</button>
    </div>
    <div class="toolbar">
      <input class="search" id="q" placeholder="搜索标题、观点、逐字稿、作者…" value="${esc(libFilter.q)}">
      <div class="seg" id="segFilter">
        <button data-v="all" class="${libFilter.starred ? "" : "on"}">全部</button>
        <button data-v="star" class="${libFilter.starred ? "on" : ""}">${ico("star", "ic sm")}星标</button>
      </div>
      <div class="seg" id="segView">
        <button data-v="card" class="${libFilter.view === "card" ? "on" : ""}">卡片</button>
        <button data-v="list" class="${libFilter.view === "list" ? "on" : ""}">详细</button>
      </div>
    </div>
    <div id="libGrid" class="${libFilter.view === "list" ? "" : "grid"}">${bodyHtml(items)}</div>`;
  bindLibrary();
  if (curF && curF.unread) {  // 进来就把小红点清掉
    api(`/api/folders/${curF.id}`, { action: "seen" }).then(() => refreshState()).catch(() => {});
  }
}

function bindLibrary() {
  let t;
  const q = $("#q");
  if (q) q.oninput = (e) => { clearTimeout(t); t = setTimeout(() => { libFilter.q = e.target.value.trim(); renderLibrary(true); }, 250); };
  $$("#segFilter button").forEach((b) => b.onclick = () => {
    libFilter.starred = b.dataset.v === "star" ? "1" : "";
    $$("#segFilter button").forEach((x) => x.classList.toggle("on", x === b));
    renderLibrary(true);
  });
  $$("#segView button").forEach((b) => b.onclick = () => {
    libFilter.view = b.dataset.v;
    saveLibView();
    $$("#segView button").forEach((x) => x.classList.toggle("on", x === b));
    renderLibrary(true);
  });
  $$("#libGrid th[data-sort]").forEach((th) => th.onclick = () => {
    const k = th.dataset.sort;
    if (libFilter.sort === k) libFilter.desc = !libFilter.desc;
    else { libFilter.sort = k; libFilter.desc = k === "date" || k === "duration"; }
    saveLibView();
    renderLibrary(true);
  });
  const add = $("#addBtn"); if (add) add.onclick = openAdd;
  const cls = $("#classifyBtn");
  if (cls) cls.onclick = async () => {
    let r;
    try { r = await api("/api/folders/classify", {}); } catch (e) { return toast(e.message); }
    if (r.nothing) return toast("待分类里没有笔记");
    toast("AI 正在逐条归类，完成后会自动刷新…", 4000);
    const t0 = Date.now();
    const timer = setInterval(async () => {
      await refreshState();
      const c = STATE.classify || {};
      if (!c.busy || Date.now() - t0 > 300000) {
        clearInterval(timer);
        if (route().name === "library") renderLibrary(true);
        toast(`归类完成：处理了 ${c.done} 条` + (c.msg ? `（中途出错：${c.msg}）` : ""));
      }
    }, 1500);
  };
  $$("#libGrid [data-id]").forEach((el) => {  // 把笔记拖到左边文件夹即可归类
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (e) => {
      dragPayload = { type: "item", id: +el.dataset.id };
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", "item:" + el.dataset.id); } catch {}
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => { el.classList.remove("dragging"); dragPayload = null; });
  });
  const rand = $("#randBtn");
  if (rand) rand.onclick = async () => {
    const all = await api("/api/items?status=done");
    if (!all.length) return toast("收藏库还是空的");
    location.hash = "#/item/" + all[Math.floor(Math.random() * all.length)].id;
  };
}

function sortItems(items) {
  const k = libFilter.sort, dir = libFilter.desc ? -1 : 1;
  const val = (it) => {
    if (k === "title") return (it.note_title || it.title || "").toLowerCase();
    if (k === "author") return (it.author || "").toLowerCase();
    if (k === "folder") return it.folder_name || "";
    if (k === "duration") return it.duration || 0;
    return it.created_at || 0;
  };
  return [...items].sort((a, b) => {
    const x = val(a), y = val(b);
    if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
    return String(x).localeCompare(String(y), "zh") * dir;
  });
}

const bodyHtml = (items) => (libFilter.view === "list" ? detailHtml(items) : gridHtml(items));

/* ---------------------------------------------------------------- 本地视频播放 */
const noVideoWhy = (it) => (it.media_type === "note"
  ? "这条是图文，没有视频"
  : "本地没有视频文件（视频自带字幕时不会下载视频，或转录后已清理）");

function videoCell(it) {
  if (it.has_video) {
    return `<span class="vcell">
      <button class="play-btn" data-play="${esc(it.video_url)}" data-title="${esc(it.note_title || it.title || "")}" data-id="${it.id}" title="在本页播放">${ico("play", "ic sm")}</button>
      <button class="loc-btn" data-loc-video="${it.id}" title="在文件夹中定位视频原文件">${ico("folder", "ic sm")}</button>
    </span>`;
  }
  return `<span class="play-btn off" tabindex="0" data-play-off="${esc(noVideoWhy(it))}" title="${esc(noVideoWhy(it))}">${ico("play", "ic sm")}</span>`;
}

let playerEl = null;
function openPlayer(url, title = "", itemId = "") {
  if (!url) return;
  closePlayer();
  playerEl = document.createElement("div");
  playerEl.className = "player-mask";
  playerEl.innerHTML = `<div class="player-box">
    <div class="player-bar">
      <span class="player-title">${esc(title)}</span><span class="spacer"></span>
      ${itemId ? `<button class="btn sm ghost" data-loc-video="${itemId}">${ico("folder", "ic sm")}定位原文件</button>` : ""}
      <a class="btn sm ghost" href="${esc(url)}" target="_blank" rel="noopener">新窗口打开</a>
      <button class="btn sm ghost" data-close>关闭</button>
    </div>
    <video src="${esc(url)}" controls autoplay playsinline preload="metadata"></video>
  </div>`;
  document.body.appendChild(playerEl);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => playerEl && playerEl.classList.add("on"));
  playerEl.addEventListener("click", (e) => {
    if (e.target === playerEl || e.target.closest("[data-close]")) closePlayer();
  });
  document.addEventListener("keydown", playerKeys);
}
function playerKeys(e) {
  const v = playerEl && playerEl.querySelector("video");
  if (!v) return;
  if (e.code === "Space" || e.key === " ") {      // 空格：暂停 / 继续
    e.preventDefault();
    if (v.paused) v.play().catch(() => {}); else v.pause();
  } else if (e.key === "Enter") {                  // 回车：全屏切换
    e.preventDefault();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else v.requestFullscreen().catch(() => toast("这个视频不支持全屏"));
  } else if (e.key === "Escape") {
    if (document.fullscreenElement) return;        // 先让浏览器退出全屏，别直接关掉浮层
    closePlayer();
  }
}
function closePlayer() {
  if (!playerEl) return;
  const v = playerEl.querySelector("video");
  if (v) { v.pause(); v.removeAttribute("src"); v.load(); }  // 断开连接，别在后台继续拉流
  playerEl.remove();
  playerEl = null;
  document.body.style.overflow = "";
  document.removeEventListener("keydown", playerKeys);
}

document.addEventListener("click", (e) => {
  const on = e.target.closest && e.target.closest("[data-play]");
  if (on) { e.preventDefault(); e.stopPropagation(); openPlayer(on.dataset.play, on.dataset.title || "", on.dataset.id || ""); return; }
  const loc = e.target.closest && e.target.closest("[data-loc-video]");
  if (loc) { e.preventDefault(); e.stopPropagation(); locateVideo(loc.dataset.locVideo); return; }
  const off = e.target.closest && e.target.closest("[data-play-off]");
  if (off) { e.preventDefault(); e.stopPropagation(); toast(off.dataset.playOff); }
});

/* 在系统文件管理器里定位视频原文件（Windows 是资源管理器里选中它） */
function locateVideo(id) {
  api("/api/open", { what: "video", id: +id })
    .then(() => toast("已定位到视频文件"))
    .catch((e) => toast(e.message));
}

function detailHtml(items) {
  if (!items.length) return gridHtml(items);
  const cols = [["title", "标题"], ["author", "作者"], ["folder", "文件夹"], ["date", "收藏日期"], ["duration", "时长"]];
  const mark = (k) => (libFilter.sort === k ? (libFilter.desc ? " ↓" : " ↑") : "");
  return `<table class="dtable"><thead><tr>
    ${cols.map(([k, l]) => `<th data-sort="${k}" class="${libFilter.sort === k ? "on" : ""}">${l}${mark(k)}</th>`).join("")}
    <th class="c-video">视频</th>
    <th>链接</th></tr></thead><tbody>
    ${items.map((it) => `<tr data-id="${it.id}">
      <td class="c-title"><a href="#/item/${it.id}">${it.starred ? ico("starFill", "ic sm star-ic") : ""}${esc(it.note_title || it.title || "未命名")}</a></td>
      <td>${esc(it.author || "")}</td>
      <td>${catChip(it.folder_name || "待分类")}</td>
      <td class="c-date">${fmtDate(it.created_at)}</td>
      <td class="c-dur">${fmtDur(it.duration)}</td>
      <td class="c-video">${videoCell(it)}</td>
      <td>${it.url ? `<a class="mini" href="${esc(it.url)}" target="_blank" rel="noopener">${it.source === "local" ? "本地" : "打开"}</a>` : ""}</td>
    </tr>`).join("")}
  </tbody></table>`;
}

function gridHtml(items) {
  if (!items.length) {
    if (libFilter.folder) return emptyHtml("inbox",
      libFilter.folder === "none" ? "待分类里没有笔记" : "这个文件夹还是空的",
      "把笔记卡片拖到左侧的文件夹上就能归类，或者点上面的「AI 自动归类」。");
    const any = STATE.stats.total;
    if (libFilter.q || libFilter.learned || libFilter.starred)
      return emptyHtml("search", "没有符合条件的笔记", "换个关键词，或者切回「全部」看看。");
    if (any) return emptyHtml("inbox", "笔记还在路上", "视频处理完会自动出现在这里。", `<a class="btn" href="#/process">查看处理进度</a>`);
    return emptyHtml("book", "收藏库还是空的", "把抖音收藏里的干货搬进来，这里会变成你的知识库。",
      `<a class="btn primary" href="#/process">${ico("plus")}同步收藏夹</a><button class="btn" onclick="openAdd()">粘贴分享链接</button>`);
  }
  return items.map((it, i) => `
    <a class="vcard" href="#/item/${it.id}" data-id="${it.id}" style="--i:${Math.min(i, 14)}">
      <div class="cover">${it.cover ? `<img src="${esc(it.cover)}" referrerpolicy="no-referrer" loading="lazy" onerror="this.remove()">` : ""}
        <div class="ph cat-${catColor(it.category)}" ${it.cover ? 'style="z-index:-1"' : ""}>${ico(it.media_type === "note" ? "file" : "play", "ic ph-ic")}</div>
        ${it.has_video
          ? `<span class="cardplay" role="button" tabindex="0" data-play="${esc(it.video_url)}" data-title="${esc(it.note_title || it.title || "")}" data-id="${it.id}" title="在本页播放">${ico("play", "ic sm")}</span>
             <span class="cardloc" role="button" tabindex="0" data-loc-video="${it.id}" title="在文件夹中定位视频原文件">${ico("folder", "ic sm")}</span>`
          : `<span class="cardplay off" role="button" tabindex="0" data-play-off="${esc(noVideoWhy(it))}" title="${esc(noVideoWhy(it))}">${ico("play", "ic sm")}</span>`}
        ${it.duration ? `<span class="dur">${fmtDur(it.duration)}</span>` : ""}</div>
      <div class="body">
        <div class="t">${it.starred ? ico("starFill", "ic star-ic") : ""}${esc(it.note_title || it.title)}</div>
        <div class="s">${esc(it.summary)}</div>
        <div class="foot">${catChip(it.folder_name || "待分类")}
          ${it.difficulty ? `<span class="chip gray">${esc(it.difficulty)}</span>` : ""}
          ${it.media_type === "note" ? `<span class="chip gray">图文</span>` : ""}
          <span class="spacer"></span><span>${esc(it.author || "")}</span></div>
      </div></a>`).join("");
}

/* ---------------------------------------------------------------- 笔记详情 */
function noteBody(it) {
  const n = it.note || {};
  const sec = (title, html) => (html ? `<section><h2>${title}</h2>${html}</section>` : "");
  return `
    ${sec("一句话总结", n.summary ? `<div class="summary">${esc(n.summary)}</div>` : "")}
    ${sec("核心观点", n.points?.length ? `<ol class="points">${n.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>` : "")}
    ${sec("照着做", n.steps?.length ? `<ol class="steps">${n.steps.map((p) => `<li><div>${esc(p)}</div></li>`).join("")}</ol>` : "")}
    ${sec("提到的工具", n.tools?.length ? `<div class="kv">${n.tools.map((t) => `<div><b>${esc(t.name)}</b><span>${esc(t.use)}</span></div>`).join("")}</div>` : "")}
    ${sec("关键概念", n.concepts?.length ? `<div class="kv">${n.concepts.map((t) => `<div><b>${esc(t.term)}</b><span>${esc(t.explain)}</span></div>`).join("")}</div>` : "")}
    ${sec("自测一下", n.quiz?.length ? `<div class="quiz">${n.quiz.map((q, i) => `<div class="q"><b>${i + 1}. ${esc(q.q)}</b>
        <div class="row" style="margin-top:6px"><button class="btn sm" data-reveal>看答案</button></div><div class="a">${ico("check", "ic sm")} ${esc(q.a)}</div></div>`).join("")}</div>` : "")}`;
}

let itemTab = "note";
let curItem = null;
let quizState = {};

const fmtEta = (s) => {
  s = Math.max(0, Math.round(s || 0));
  if (s < 10) return "马上就好";
  if (s < 60) return `约 ${s} 秒`;
  const m = Math.floor(s / 60), r = s % 60;
  if (m < 60) return `约 ${m} 分${r >= 30 && m < 10 ? "半" : ""}钟`;
  return `约 ${Math.floor(m / 60)} 小时 ${m % 60} 分`;
};
const fmtTs = (sec) => { sec = Math.round(sec || 0); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(s).padStart(2, "0"); };
const mdLite = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");

async function copyText(text, msg = "已复制") {
  try { await navigator.clipboard.writeText(text); }
  catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
  toast(msg);
}

function deepBusy(id) {
  const d = STATE?.deep || {};
  return d.item_id === id || (d.pending || []).includes(id);
}

async function renderItem(id, tab) {
  let it;
  if (curItem?.id !== id) view.innerHTML = skeletonItem();
  try { it = await api(`/api/items/${id}`); } catch (e) { view.innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
  if (tab) itemTab = tab;
  if (curItem?.id !== id && !tab) { itemTab = "script"; quizState = {}; }
  if (it.source === "paste" && itemTab === "script" && !tab && curItem?.id !== id) itemTab = "summary";
  curItem = it;
  const n = it.note || {};
  const folders = STATE.folders || [];
  const [stText, stCls] = STATUS[it.status] || [it.status, "gray"];
  const isNote = it.media_type === "note";
  const tabs = [["script", "逐字稿"], ["summary", "总结稿"], ["mindmap", "思维导图"]];
  const srcLink = it.url
    ? `<a class="src-link" href="${esc(it.url)}" target="_blank" rel="noopener">${ico("external", "ic sm")}${esc(prettyUrl(it.url))}</a>`
    : (it.local_path ? `<span class="src-link">${ico("folder", "ic sm")}本地：${esc(it.local_path)}</span>` : "");
  view.innerHTML = `
    <a class="back" href="javascript:history.length>1?history.back():location.hash='#/library'">← 返回</a>
    <article class="note wide">
      <div class="head-row">
        <h1>${esc(n.title || it.title || "未命名")}</h1>
        <div class="head-actions">
          ${it.url ? `<a class="btn sm" href="${esc(it.url)}" target="_blank" rel="noopener">${isNote ? ico("external") + "原图文" : ico("play") + "原视频"}</a>` : ""}
          <button class="btn sm" id="starBtn">${it.starred ? ico("starFill", "ic star-ic") + "已星标" : ico("star") + "星标"}</button>
        </div>
      </div>
      ${srcLink ? `<div class="src-row">${srcLink}</div>` : ""}
      <div class="meta">
        ${it.status !== "done" ? `<span class="chip ${stCls}">${stText}</span>` : ""}
        ${n.difficulty ? `<span class="chip gray">${esc(n.difficulty)}</span>` : ""}
        <span class="muted">${esc(it.author || "未知作者")}${it.duration ? " · " + fmtDur(it.duration) : ""}${it.created_at ? " · 收藏于 " + fmtDate(it.created_at) : ""}</span>
        ${(n.tags || []).map((t) => `<span class="muted">#${esc(t)}</span>`).join(" ")}
      </div>
      ${it.title && it.title !== n.title && it.source !== "paste" ? `<div class="muted small">原标题：${esc(it.title)}</div>` : ""}
      <div class="act-row">
        <button class="btn sm ghost" id="delBtn" style="color:var(--bad)">${ico("x")}删除笔记</button>
        <button class="btn sm" id="pdfBtn">${ico("file")}导出 PDF</button>
        <a class="btn sm" href="/api/items/${it.id}/md">${ico("download")}下载 MD</a>
        ${it.md_path ? `<button class="btn sm" id="revealBtn">${ico("folder")}定位笔记文件</button>` : ""}
        ${it.has_video ? `<button class="btn sm" id="locVideoBtn" data-loc-video="${it.id}">${ico("folder")}定位视频文件</button>` : ""}
      </div>
      ${it.reason ? `<div class="banner warn" style="margin-top:14px">${esc(it.reason)}</div>` : ""}
      <div class="tabs-row">
        <div class="tabs itabs" id="itabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${itemTab === k ? "on" : ""}">${l}</button>`).join("")}</div>
        <span class="spacer"></span>
        ${it.status === "done" ? `<span class="cat-pick"><label>文件夹</label><select id="folderSel"><option value="" ${it.folder_id ? "" : "selected"}>待分类</option>${folders.map((f) => `<option value="${f.id}" ${String(it.folder_id) === String(f.id) ? "selected" : ""}>${esc(f.name)}</option>`).join("")}</select></span>` : ""}
      </div>
      <div id="tabBody"></div>
      <div class="foot-actions">
        ${it.status === "irrelevant" ? `<button class="btn sm accent" id="includeBtn">我觉得有用，收进收藏库</button>` : ""}
        ${["failed", "skipped", "need_key", "irrelevant", "done"].includes(it.status) && it.transcript && it.source !== "paste"
          ? `<button class="btn sm" id="reBtn">${ico("sparkles")}重新 AI 提炼</button>` : ""}
        ${it.status === "failed" && !it.transcript ? `<button class="btn sm" id="retryBtn">重试</button>` : ""}
      </div>
    </article>`;

  $$("#itabs button").forEach((b) => b.onclick = () => { itemTab = b.dataset.t; $$("#itabs button").forEach((x) => x.classList.toggle("on", x === b)); renderTab(); });
  renderTab();

  const act = (action, extra = {}) => api(`/api/items/${id}/action`, { action, ...extra });
  $("#starBtn").onclick = async () => { await act("star", { value: !it.starred }); renderItem(id, itemTab); };
  $("#pdfBtn").onclick = () => window.open(`/print?ids=${id}`, "_blank");
  $("#revealBtn") && ($("#revealBtn").onclick = () => api("/api/open", { what: "item", id }).catch((e) => toast(e.message)));
  $("#includeBtn") && ($("#includeBtn").onclick = async () => { await act("include"); toast("已收进收藏库"); refreshState(); renderItem(id, itemTab); });
  $("#reBtn") && ($("#reBtn").onclick = async () => { await act("reextract"); toast("已加入队列，稍等片刻"); location.hash = "#/process"; });
  $("#retryBtn") && ($("#retryBtn").onclick = async () => { await act("retry"); toast("已重新加入队列"); location.hash = "#/process"; });
  $("#folderSel") && ($("#folderSel").onchange = async (e) => {
    const v = e.target.value;
    await act("folder", { value: v === "" ? null : +v });
    toast(v === "" ? "已移到待分类" : "已移动");
    refreshState(); renderItem(id, itemTab);
  });
  $("#delBtn").onclick = async () => {
    if (!confirm("删除这条笔记？\n\n对应的 MD 笔记文件会一起删掉。")) return;
    let withVideo = false;
    if (it.has_video) {
      const f = it.video_file || "";
      const dir = f.replace(/[\\/][^\\/]*$/, "");
      const brief = (s) => (s.length > 56 ? s.slice(0, 26) + "…" + s.slice(-26) : s);
      withVideo = confirm(
        "同时删掉本地视频文件吗？\n\n" +
        "文件：" + f.replace(/^.*[\\/]/, "") + "\n" +
        "位置：" + brief(dir) + "\n\n" +
        "点「确定」= 笔记和视频一起删（视频进回收站，还能还原）\n" +
        "点「取消」= 只删笔记，视频留在原处"
      );
    }
    let r;
    try { r = await act("delete", { with_video: withVideo }); }
    catch (e) { return toast(e.message); }
    const fail = r.videos_failed || [];
    const done = r.videos_removed || [];
    if (fail.length) toast(`笔记已删除，但视频没删掉：${fail.map((x) => x.name).join("、")}（${fail[0].why}）`, 5000);
    else if (withVideo && done.length) toast(`已删除，视频${done[0].how}（${done[0].name}）`, 4000);
    else if (withVideo) toast("已删除笔记（没找到可删的视频文件）");
    else toast("已删除笔记，视频保留在本地");
    location.hash = "#/library";
  };
}

function renderTab() {
  const it = curItem, el = $("#tabBody");
  if (!el) return;
  el.classList.remove("fade-in"); void el.offsetWidth; el.classList.add("fade-in");
  if (itemTab === "script") renderScriptTab(el);
  else if (itemTab === "summary") renderSummaryTab(el);
  else renderMindmapTab(el);
}

const mdInline = (t) => esc(t)
  .replace(/&lt;mark&gt;([\s\S]+?)&lt;\/mark&gt;/g, "<mark>$1</mark>")
  .replace(/\*\*([\s\S]+?)\*\*/g, "<b>$1</b>")
  .replace(/(^|[^*])\*([^*\n]+?)\*/g, "$1<i>$2</i>");

function mdArticle(t) {
  const raw = (t || "").replace(/\r/g, "");
  return raw.split(/\n{2,}/)
    .map((p) => p.replace(/^[\s　]+|[\s　]+$/g, ""))
    .filter(Boolean)
    .map((p) => `<p>${mdInline(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function splitParagraphs(text, segs) {
  const out = [];
  if (segs && segs.length) {
    let buf = [], chars = 0, last = null;
    segs.forEach((s) => {
      if (last !== null && (s.start - last > 2.5 || chars > 140)) { out.push(buf.join("")); buf = []; chars = 0; }
      buf.push(s.text); chars += (s.text || "").length; last = s.end;
    });
    if (buf.length) out.push(buf.join(""));
  } else {
    const sentences = (text || "").match(/[^。！？!?\n]+[。！？!?]?/g) || [text || ""];
    let buf = [], chars = 0;
    sentences.forEach((s) => {
      buf.push(s); chars += s.length;
      if (chars > 140) { out.push(buf.join("")); buf = []; chars = 0; }
    });
    if (buf.length) out.push(buf.join(""));
  }
  return out.map((p) => p.trim()).filter(Boolean);
}

function copyBtn(id, label) {
  return `<button class="btn sm ghost cp-btn" id="${id}">${ico("copy")}${label}</button>`;
}

function renderScriptTab(el) {
  const it = curItem, n = it.note || {};
  if (!it.transcript) { el.innerHTML = `<div class="empty" style="padding:30px">还没有逐字稿</div>`; return; }
  const oneLine = (n.one_line || "").trim() || (n.summary || "").split(/[。！？]/)[0] || "";
  const paras = splitParagraphs(it.transcript, it.segments || []);
  const body = paras.map((p) => `<p>${esc(p)}</p>`).join("");
  el.innerHTML = `
    ${oneLine ? `<section class="blk">
      <div class="blk-head"><h2>一句话总结</h2><span class="spacer"></span>${copyBtn("cpOne", "复制")}</div>
      <p class="one-line">${esc(oneLine)}</p></section>` : ""}
    <section class="blk">
      <div class="blk-head"><h2>逐字稿</h2><span class="muted small">${it.transcript.length} 字 · 机器转写，仅做分段</span><span class="spacer"></span>${copyBtn("cpAll", "复制逐字稿")}</div>
      ${it.images?.length ? galleryHtml(it.images) : ""}
      <div class="article-body">${body}</div>
    </section>`;
  const cpOne = $("#cpOne"); if (cpOne) cpOne.onclick = () => copyText(oneLine, "一句话总结已复制");
  $("#cpAll").onclick = () => copyText(it.transcript, "逐字稿已复制");
  if (it.images?.length) bindGallery(el, it.images);
}

function renderSummaryTab(el) {
  const it = curItem, n = it.note || {}, d = it.deep || {};
  const sumMd = (n.summary_md || "").trim();
  const logMd = (n.logic_md || "").trim();
  const sumFallback = (n.points || []).length
    ? `<ul class="points">${n.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : (n.summary ? `<p>${esc(n.summary)}</p>` : "");
  const logFallback = (d.outline || []).length
    ? `<div class="outline">${d.outline.map((o) => `<div class="ol-item"><div class="ol-head">${o.time ? `<span class="ts-btn">${esc(o.time)}</span>` : ""}<b>${esc(o.title)}</b></div>${o.points?.length ? `<ul>${o.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}</div>`).join("")}</div>`
    : "";
  if (!sumMd && !logMd && !sumFallback && !logFallback) {
    el.innerHTML = `<div class="empty" style="padding:30px">还没有总结稿。点右下角「重新 AI 提炼」可以生成。</div>`;
    return;
  }
  el.innerHTML = `
    <section class="blk">
      <div class="blk-head"><h2>核心内容拆解</h2><span class="spacer"></span>${copyBtn("cpSum", "复制")}</div>
      <div class="article-body">${sumMd ? mdArticle(sumMd) : sumFallback}</div>
    </section>
    <section class="blk">
      <div class="blk-head"><h2>主线逻辑</h2><span class="spacer"></span>${copyBtn("cpLog", "复制")}</div>
      <div class="article-body">${logMd ? mdArticle(logMd) : logFallback}</div>
    </section>`;
  const cpSum = $("#cpSum");
  if (cpSum) cpSum.onclick = () => copyText(sumMd || (n.points || []).concat(n.summary ? [n.summary] : []).join("\n") || "", "核心内容已复制");
  const cpLog = $("#cpLog"); if (cpLog) cpLog.onclick = () => copyText(logMd, "主线逻辑已复制");
}

function renderMindmapTab(el) {
  const it = curItem;
  const mm = it.mindmap || "";
  if (!mm) {
    el.innerHTML = `<div class="empty" style="padding:40px 20px">
      <p style="margin:0 0 8px">这条还没有思维导图。</p>
      <p class="muted small" style="margin:0 0 18px">会读取文字稿，让 AI 梳理成一张图。一次 AI 调用，约 10～30 秒。</p>
      <button class="btn accent" id="genMind">${ico("sparkles")}生成思维导图</button></div>`;
    $("#genMind").onclick = () => genMindmap(it.id, el);
    return;
  }
  el.innerHTML = `
    <div class="row" style="margin:14px 0 10px">
      <a class="btn sm" href="/api/items/${it.id}/mindmap.html" target="_blank">${ico("external")}新窗口全屏</a>
      <a class="btn sm" href="/api/items/${it.id}/mindmap.html?download=1">${ico("download")}下载网页</a>
      <button class="btn sm" id="cpMind">${ico("copy")}复制 Markmap 文本</button>
      <span class="spacer"></span>
      <button class="btn sm ghost" id="reMind">${ico("retry")}重新生成</button>
    </div>
    <iframe class="mindmap" src="/api/items/${it.id}/mindmap.html"></iframe>
    <div class="muted small" style="margin-top:8px">滚轮缩放 · 拖动平移 · 点圆点折叠</div>`;
  $("#cpMind").onclick = () => copyText(mm, "Markmap 文本已复制");
  $("#reMind").onclick = () => {
    if (confirm("重新生成会覆盖当前这张图，继续？")) genMindmap(it.id, el);
  };
}

function genMindmap(id, el) {
  const btn = $("#genMind") || $("#reMind");
  const old = btn ? btn.innerHTML : "";
  if (btn) { btn.disabled = true; btn.innerHTML = "生成中…"; }
  toast("正在生成思维导图，约 10～30 秒", 5000);
  api(`/api/items/${id}/mindmap`, {}).then(() => {
    renderItem(id, "mindmap");
    toast("思维导图生成好了");
  }).catch((e) => {
    toast(e.message, 5000);
    if (btn) { btn.disabled = false; btn.innerHTML = old; }
  });
}

function renderTextTab(el, focusSec) {
  const it = curItem;
  if (!it.transcript) { el.innerHTML = `<div class="empty" style="padding:30px">还没有文字稿</div>`; return; }
  const segs = it.segments || [];
  if (it.images?.length) {
    const parts = {}; let intro = "";
    it.transcript.split(/\n\n(?=【)/).forEach((blk) => {
      const m = blk.match(/^【图(\d+)】\n?([\s\S]*)$/);
      if (m) parts[+m[1]] = m[2]; else intro += blk.replace(/^【正文】\n?/, "") + "\n";
    });
    el.innerHTML = `<div class="row" style="margin:14px 0 10px"><span class="muted small">图文 · ${it.images.length} 张图 · 图片里的文字由本机识别，可能有错字</span>
        <span class="spacer"></span><button class="btn sm" id="cpTr">复制全部文字</button></div>
      ${intro.trim() ? `<div class="summary" style="margin-bottom:14px;white-space:pre-wrap">${esc(intro.trim())}</div>` : ""}
      <div class="ocr-list">${it.images.map((src, i) => `<div class="ocr-row">
        <img src="/files/${encodeURI(src)}" data-g="${i}" loading="lazy">
        <div class="ocr-text"><div class="muted small">图 ${i + 1}</div>${parts[i + 1] ? esc(parts[i + 1]) : '<span class="muted">（这张图没有识别到文字）</span>'}</div></div>`).join("")}</div>`;
    $("#cpTr").onclick = () => copyText(it.transcript, "文字已复制");
    bindGallery(el, it.images);
    return;
  }
  el.innerHTML = `<div class="row" style="margin:14px 0 10px"><span class="muted small">${it.transcript.length} 字${segs.length ? " · 在精读大纲里点时间，会跳到这里对应的位置" : ""}</span>
      <span class="spacer"></span><button class="btn sm" id="cpTr">复制全文</button></div>
    ${segs.length ? `<div class="tsegs">${segs.map((s, i) => `<div class="tseg" id="seg-${i}" data-start="${s.start}"><span class="ts">${fmtTs(s.start)}</span><span>${esc(s.text)}</span></div>`).join("")}</div>`
      : `<div class="transcript" style="max-height:none">${esc(it.transcript)}</div>`}`;
  $("#cpTr").onclick = () => copyText(it.transcript, "文字稿已复制");
  if (focusSec != null && segs.length) {
    let idx = 0;
    segs.forEach((s, i) => { if (s.start <= focusSec + 0.5) idx = i; });
    const row = $(`#seg-${idx}`);
    if (row) { row.classList.add("hl"); row.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => row.classList.remove("hl"), 2500); }
  }
}

function deepModelName() {
  const s = STATE.settings;
  return s.deep_same ? s.model : s.deep_model;
}

function renderDeepTab(el) {
  const it = curItem, d = it.deep, chat = it.chat || {};
  const busy = deepBusy(it.id);
  if (busy) {
    const ds = STATE.deep || {};
    const mine = ds.item_id === it.id;
    el.innerHTML = `<div class="card deep-run" id="deepRun" style="margin-top:16px">
        <div class="row"><div class="spinner"></div><b>${mine ? esc(ds.label || "精读中") : "排队等待精读……"}</b><span class="spacer"></span>
        <span class="muted small">${mine ? `第 ${ds.step}/${ds.steps} 步 · ${fmtEta(ds.eta)}` : ""}</span></div>
        <div class="bar" style="margin-top:10px"><i style="width:${mine ? ds.pct : 2}%"></i></div>
        <div class="muted small" style="margin-top:8px">用 ${esc(deepModelName())} 生成核心结论、章节大纲、概念、理解检查题、测验、Anki 卡片和思维导图。可以先去看别的，好了会自动显示。</div></div>`;
    return;
  }
  if (!d) {
    el.innerHTML = `
      ${chat.deep_error ? `<div class="banner warn" style="margin-top:14px">上次精读失败：${esc(chat.deep_error)}</div>` : ""}
      <div class="card" style="margin-top:16px">
        <h2>有人带着读</h2>
        <p class="muted">让 AI 像老师一样带你读这段内容：先给 5 句核心结论，再按章节列大纲（带时间戳，点击跳到原文），解释关键概念；
          然后不直接给答案，用提问检查你是否真懂（你写回答，AI 点评）；最后出 10 道测验题，做成 Anki 卡片，画思维导图。</p>
        <p class="muted small">使用模型：<b>${esc(deepModelName() || "未设置")}</b>（在设置 → 精读 里可以换成 Claude 等）。文稿很长时会自动分段预读再合并。</p>
        <div class="row" style="margin-top:12px">
          <button class="btn primary" id="deepGo" ${it.transcript ? "" : "disabled"}>开始精读</button>
          <button class="btn" id="copyPrompt" ${it.transcript ? "" : "disabled"}>${ico("copy")}复制提示词+文稿（粘贴到豆包 / Kimi / 千问 / Claude）</button>
        </div>
        ${it.transcript ? "" : `<div class="muted small" style="margin-top:8px">这条还没有文字稿，处理完才能精读。</div>`}
      </div>`;
    $("#deepGo") && ($("#deepGo").onclick = startDeep);
    $("#copyPrompt") && ($("#copyPrompt").onclick = copyPrompt);
    return;
  }

  const checks = chat.checks || {};
  const qs = quizState[it.id] || (quizState[it.id] = {});
  el.innerHTML = `
    ${chat.deep_error ? `<div class="banner warn" style="margin-top:14px">上次重新精读失败：${esc(chat.deep_error)}（下面是之前的结果）</div>` : ""}
    <div class="row deep-head"><span class="muted small">由 ${esc(d.model || "")} 生成${d.chunks > 1 ? ` · 分 ${d.chunks} 段预读后合并` : ""}</span><span class="spacer"></span>
      <button class="btn sm" id="copyPrompt">${ico("copy")}复制给其他 AI</button><button class="btn sm ghost" id="deepRedo">重新精读</button></div>

    ${d.conclusions.length ? `<section><h2>核心结论</h2><ol class="points">${d.conclusions.map((c) => `<li>${esc(c)}</li>`).join("")}</ol></section>` : ""}

    ${d.outline.length ? `<section><h2>章节大纲</h2><div class="outline">${d.outline.map((o) => `
      <div class="ol-item"><div class="ol-head">${o.time ? `<button class="ts-btn" data-sec="${o.sec ?? ""}" title="跳到文字稿这里">${esc(o.time)}</button>` : ""}<b>${esc(o.title)}</b></div>
      ${o.points.length ? `<ul>${o.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}</div>`).join("")}</div></section>` : ""}

    ${d.concepts.length ? `<section><h2>关键概念与术语</h2><div class="kv">${d.concepts.map((c) => `<div><b>${esc(c.term)}</b><span>${esc(c.explain)}</span></div>`).join("")}</div></section>` : ""}

    ${d.check_questions.length ? `<section><h2>你真的懂了吗？</h2>
      <p class="muted small" style="margin-top:-4px">不直接给答案。用自己的话回答，老师会点评并继续追问。</p>
      ${d.check_questions.map((q, i) => { const c = checks[i]; return `
        <div class="cq card" data-i="${i}">
          <div><b>${i + 1}. ${esc(q.q)}</b></div>
          <div class="row" style="margin:8px 0"><button class="btn sm ghost" data-hint>${ico("bulb")}给点提示</button>${c ? `<button class="btn sm ghost" data-key>${ico("eye")}看参考要点</button>` : ""}</div>
          <div class="hint-box" hidden>${ico("bulb")}${esc(q.hint)}</div>
          <div class="key-box" hidden>${ico("eye")}${esc(q.key)}</div>
          <textarea rows="3" placeholder="用自己的话写下你的理解……">${esc(c?.answer || "")}</textarea>
          <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn sm primary" data-submit>${c ? "再答一次" : "提交给老师"}</button></div>
          <div class="feedback" ${c ? "" : "hidden"}>${c ? mdLite(c.feedback) : ""}</div>
        </div>`; }).join("")}</section>` : ""}

    ${d.quiz.length ? `<section><h2>测验（${d.quiz.length} 题）</h2><div id="quizBox"></div></section>` : ""}

    ${d.anki.length ? `<section><h2>Anki 卡片（${d.anki.length} 张）</h2>
      <div class="row" style="margin-bottom:10px"><a class="btn sm" href="/api/items/${it.id}/anki.txt">${ico("download")}下载 .txt</a>
        <button class="btn sm" id="cpAnki">${ico("copy")}复制「问题⇥答案」</button>
        <span class="muted small">Anki 里选「文件 → 导入」，分隔符选 Tab</span></div>
      <table class="anki"><thead><tr><th>问题</th><th>答案</th></tr></thead><tbody>
        ${d.anki.map((c) => `<tr><td>${esc(c.q)}</td><td>${esc(c.a)}</td></tr>`).join("")}</tbody></table></section>` : ""}



    <section><h2>问老师</h2>
      <div class="asklog" id="askLog">${(chat.ask || []).map((a) => `<div class="qa"><div class="q-me">${esc(a.q)}</div><div class="a-ai">${mdLite(a.a)}</div></div>`).join("")}</div>
      <div class="row ask-row"><input id="askIn" class="search" placeholder="哪里没看懂？随便问，比如「第二章那个方法具体怎么做？」"><button class="btn primary" id="askBtn">提问</button></div>
    </section>`;

  $("#copyPrompt").onclick = copyPrompt;
  $("#deepRedo").onclick = () => { if (confirm("重新精读会覆盖现在的结果（答题记录保留），确定？")) startDeep(); };
  $$(".ts-btn", el).forEach((b) => b.onclick = () => {
    if (!(it.segments || []).length) return toast("这条逐字稿没有时间信息");
    itemTab = "script"; $$("#itabs button").forEach((x) => x.classList.toggle("on", x.dataset.t === "script"));
    renderScriptTab($("#tabBody"));
  });
  $$(".cq", el).forEach((card) => {
    const i = +card.dataset.i;
    $("[data-hint]", card).onclick = () => { $(".hint-box", card).hidden = false; };
    $("[data-key]", card) && ($("[data-key]", card).onclick = () => { $(".key-box", card).hidden = false; });
    $("[data-submit]", card).onclick = async (e) => {
      const ans = $("textarea", card).value.trim();
      if (!ans) return toast("先写下你的回答");
      const btn = e.target; btn.disabled = true; btn.textContent = "老师在看……";
      const fb = $(".feedback", card); fb.hidden = false; fb.innerHTML = `<span class="muted">思考中……</span>`;
      try {
        const r = await api(`/api/items/${it.id}/check`, { idx: i, answer: ans });
        fb.innerHTML = mdLite(r.feedback);
        (curItem.chat ||= {}).checks ||= {}; curItem.chat.checks[i] = r;
        if (!$("[data-key]", card)) $("[data-hint]", card).insertAdjacentHTML("afterend", `<button class="btn sm ghost" data-key>${ico("eye")}看参考要点</button>`);
        $("[data-key]", card).onclick = () => { $(".key-box", card).hidden = false; };
      } catch (err) { fb.innerHTML = `<span style="color:var(--bad)">${esc(err.message)}</span>`; }
      btn.disabled = false; btn.textContent = "再答一次";
    };
  });
  if (d.quiz.length) renderQuiz(it, d.quiz, qs);
  $("#cpAnki") && ($("#cpAnki").onclick = () => copyText(d.anki.map((c) => `${c.q}\t${c.a}`).join("\n"), "Anki 卡片已复制"));
  const ask = async () => {
    const q = $("#askIn").value.trim(); if (!q) return;
    const log = $("#askLog"); $("#askIn").value = "";
    log.insertAdjacentHTML("beforeend", `<div class="qa"><div class="q-me">${esc(q)}</div><div class="a-ai muted" id="pendingA">老师在想……</div></div>`);
    $("#askBtn").disabled = true;
    try { const r = await api(`/api/items/${it.id}/ask`, { q }); $("#pendingA").outerHTML = `<div class="a-ai">${mdLite(r.a)}</div>`;
      ((curItem.chat ||= {}).ask ||= []).push(r);
    } catch (e) { $("#pendingA").outerHTML = `<div class="a-ai" style="color:var(--bad)">${esc(e.message)}</div>`; }
    $("#askBtn").disabled = false;
  };
  $("#askBtn").onclick = ask;
  $("#askIn").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.isComposing) ask(); });
}

function renderQuiz(it, quiz, qs) {
  const box = $("#quizBox"); if (!box) return;
  const answered = Object.keys(qs).length;
  const score = Object.entries(qs).filter(([i, a]) => quiz[i] && a === quiz[i].answer).length;
  box.innerHTML = quiz.map((q, i) => {
    const pick = qs[i];
    return `<div class="quiz-q card" data-i="${i}"><b>${i + 1}. ${esc(q.q)}</b>
      <div class="opts">${q.options.map((o, j) => {
        let cls = "";
        if (pick !== undefined) cls = j === q.answer ? "right" : (j === pick ? "wrong" : "dim");
        return `<button class="opt ${cls}" data-j="${j}" ${pick !== undefined ? "disabled" : ""}>${"ABCDEFGH"[j]}. ${esc(o)}</button>`; }).join("")}</div>
      ${pick !== undefined ? `<div class="explain">${pick === q.answer ? `<span class="ok-t">${ico("checkCircle")}答对了</span>` : `<span class="bad-t">${ico("xCircle")}正确答案是</span> ${"ABCDEFGH"[q.answer]}`}${q.explain ? "　" + esc(q.explain) : ""}</div>` : ""}</div>`;
  }).join("") + `<div class="row quiz-score"><b>${answered === quiz.length ? `${ico("trophy")} 完成！得分 ${score} / ${quiz.length}` : `已答 ${answered} / ${quiz.length}，答对 ${score} 题`}</b>
      <span class="spacer"></span>${answered ? `<button class="btn sm" id="quizReset">重做</button>` : ""}</div>`;
  $$(".opt", box).forEach((b) => b.onclick = () => {
    const i = +b.closest(".quiz-q").dataset.i; qs[i] = +b.dataset.j;
    const y = window.scrollY; renderQuiz(it, quiz, qs); window.scrollTo(0, y);
    if (Object.keys(qs).length === quiz.length) {
      const sc = Object.entries(qs).filter(([k, a]) => a === quiz[k].answer).length;
      api(`/api/items/${it.id}/quiz`, { score: sc, total: quiz.length }).catch(() => {});
    }
  });
  $("#quizReset") && ($("#quizReset").onclick = () => { for (const k in qs) delete qs[k]; renderQuiz(it, quiz, qs); });
}

async function startDeep() {
  const it = curItem;
  try {
    const r = await api(`/api/items/${it.id}/deep`, {});
    wasDeepBusy = true;
    toast(`开始精读（${r.model || ""}），长文稿需要几分钟`);
    await refreshState(); itemTab = "deep"; renderTab();
  } catch (e) { toast(e.message, 4000); }
}

async function copyPrompt() {
  try { const r = await api(`/api/items/${curItem.id}/prompt`); copyText(r.text, "提示词和文稿已复制，可以粘贴到任意 AI 对话里"); }
  catch (e) { toast(e.message); }
}

/* ---------------------------------------------------------------- 添加与处理 */
function openAdd() { $("#addModal").hidden = false; setTimeout(() => $("#addText").focus(), 30); }
$$("#addModal [data-close]").forEach((b) => b.addEventListener("click", () => ($("#addModal").hidden = true)));
$("#addModal").addEventListener("click", (e) => { if (e.target.id === "addModal") e.target.hidden = true; });
$("#addSubmit").onclick = async () => {
  const text = $("#addText").value;
  try {
    const r = await api("/api/links", { text });
    $("#addText").value = ""; $("#addModal").hidden = true;
    toast(r.added ? `找到 ${r.found} 个链接，新增 ${r.added} 条，开始处理` : `找到 ${r.found} 个链接，都已经添加过了`);
    location.hash = "#/process";
  } catch (e) { toast(e.message, 4000); }
};

async function renderProcess() {
  await refreshState();
  const s = STATE.settings;
  view.innerHTML = `
    <div class="head"><div><h1>添加与处理</h1><div class="muted">视频：读取信息 → 下载 → 本地转文字 → AI 提炼；图文：下载图片 → 识别图片文字 → AI 提炼</div></div></div>
    ${bannerHtml()}
    <div class="card sync-card">
      <div class="sync-intro">
        <h2>同步抖音收藏夹</h2>
        <p class="muted small">会弹出浏览器窗口，第一次需要用抖音 App 扫码登录（只登录一次）。读取时会自动慢慢滚动，请不要关闭那个窗口。之前失败的视频会自动重新排队。</p>
      </div>
      <div class="sync-form">
        <div class="field"><label>读取哪个列表</label><select id="sKind"><option value="collection">我的收藏</option><option value="like">我的喜欢</option></select></div>
        <div class="field"><label>最多读取几条（从最新开始）</label><input id="sLimit" type="number" min="1" max="2000" value="${s.sync_limit || 50}"></div>
        <div class="row sync-btns"><button class="btn" id="loginBtn">只登录抖音</button><button class="btn primary" id="syncBtn">开始同步</button></div>
      </div>
    </div>
    <div class="panels">
      <div class="card col-card">
        <h2>粘贴分享链接</h2>
        <p class="muted small">抖音里点「分享 → 复制链接」，视频和图文都可以，一次能贴很多条。</p>
        <textarea id="pText" rows="5" placeholder="粘贴一条或多条抖音分享内容……"></textarea>
        <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn primary" id="pAdd">添加并处理</button></div>
      </div>
      <div class="card col-card">
        <h2>导入本地视频</h2>
        <p class="muted small">链接解析不了时的备用办法：把视频文件（mp4 / mov / mp3 等）放进「收件箱」文件夹，再点扫描。原文件不会被删除。</p>
        <div class="inbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6H3v-6z"/></svg>
          <span class="muted small">收件箱文件夹</span></div>
        <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn" id="inboxOpen">打开收件箱文件夹</button><button class="btn primary" id="inboxScan">扫描并处理</button></div>
      </div>
    </div>
    <div class="card status-card" id="statusCard" style="margin-bottom:20px"></div>
    <div class="card">
      <div class="tabs" id="tabs"></div>
      <div class="qlist" id="qlist"></div>
    </div>
    <div class="row" style="margin-top:22px;margin-bottom:12px"><h2 style="margin:0">运行日志</h2><span class="spacer"></span>
      <button class="btn sm" id="copyLogs">${ico("copy")}一键复制日志</button></div>
    <div class="logs" id="logs"></div>`;

  $("#pAdd").onclick = async () => {
    try { const r = await api("/api/links", { text: $("#pText").value }); $("#pText").value = "";
      toast(r.added ? `新增 ${r.added} 条，开始处理` : "这些链接都已经添加过了"); renderProcessLive(); } catch (e) { toast(e.message, 4000); }
  };
  $("#syncBtn").onclick = async () => {
    await api("/api/sync", { kind: $("#sKind").value, limit: +$("#sLimit").value || 50 });
    toast("开始同步，请留意弹出的浏览器窗口"); renderProcessLive();
  };
  $("#loginBtn").onclick = async () => { await api("/api/login", {}); toast("请在弹出的浏览器窗口里扫码登录"); };
  $("#copyLogs").onclick = async () => {
    const text = (STATE.logs || []).map((l) => `${fmtTime(l.t)} ${l.msg}`).join("\n");
    if (!text) return toast("还没有日志");
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
    }
    toast(`已复制 ${STATE.logs.length} 行日志，可以直接粘贴发给我`);
  };
  $(".inbox-box").onclick = () => api("/api/open", { what: "inbox" }).catch((e) => toast(e.message));
  $("#inboxOpen").onclick =() => api("/api/open", { what: "inbox" }).catch((e) => toast(e.message));
  $("#inboxScan").onclick = async () => { const r = await api("/api/inbox", {}); toast(r.added ? `新增 ${r.added} 个文件，开始处理` : "收件箱里没有新文件"); renderProcessLive(); };
  renderProcessLive();
}

const TABS = [
  ["active", "处理中", ACTIVE], ["failed", "失败", ["failed"]], ["need_key", "待提炼", ["need_key"]],
  ["irrelevant", "主题无关", ["irrelevant"]], ["skipped", "已跳过", ["skipped"]], ["done", "已完成", ["done"]],
];

async function renderProcessLive() {
  if (!$("#statusCard")) return;
  const w = STATE.worker, st = STATE.stats.by_status;
  const pg = STATE.progress || {};
  $("#statusCard").innerHTML = w.busy
    ? (pg.item_id ? `<div class="pcard">
        <div class="row"><div class="spinner"></div><b class="ptitle">${esc(pg.title || "处理中")}</b><span class="spacer"></span><button class="btn sm" id="stopBtn">停止</button></div>
        <div class="stepper">${["fetching", "downloading", "transcribing", "extracting"].map((k) => {
            const lbl = (pg.is_note ? { fetching: "读取图文", downloading: "下载图片", transcribing: "识别图片文字", extracting: "AI 提炼" }
              : { fetching: "读取信息", downloading: "下载", transcribing: "转文字", extracting: "AI 提炼" })[k];
            const order = ["fetching", "downloading", "transcribing", "extracting"];
            const cls = k === pg.stage ? "now" : (order.indexOf(k) < order.indexOf(pg.stage) ? "done" : "");
            return `<span class="step ${cls}">${cls === "done" ? "✓ " : ""}${lbl}${k === pg.stage ? ` ${pg.stage_pct}%` : ""}</span>`; }).join('<span class="arrow">›</span>')}</div>
        <div class="bar big-bar"><i style="width:${pg.pct}%"></i></div>
        <div class="row small"><b>${pg.pct}%</b><span class="muted">这一条预计还剩 ${fmtEta(pg.eta)}${pg.real ? "" : "（估算）"}</span><span class="spacer"></span>
          <span class="muted">${w.total ? `本批 ${w.done + 1} / ${w.total}` : ""}${pg.batch_eta > pg.eta + 5 ? ` · 全部预计还剩 ${fmtEta(pg.batch_eta)}` : ""}</span></div>
      </div>`
      : `<div class="spinner"></div><div style="flex:1"><b>${esc(w.stage || "处理中…")}</b>
        <div class="muted small">${w.total ? `本批进度 ${w.done} / ${w.total}` : ""}</div></div>
        <button class="btn" id="stopBtn">停止</button>`)
    : `<div class="idle-ic">${ico("coffee")}</div><div style="flex:1"><b>空闲中</b><div class="muted small">
        ${(st.queued || 0) ? `队列里还有 ${st.queued} 条等待处理` : "添加视频后会自动开始处理"}</div></div>
        ${(st.failed || 0) ? `<button class="btn" id="retryFailed">${ico("retry")}重试失败的 ${st.failed} 条</button>` : ""}
        ${(st.queued || 0) ? `<button class="btn primary" id="goBtn">开始处理</button>` : ""}`;
  $("#retryFailed") && ($("#retryFailed").onclick = async () => {
    const failed = await api("/api/items?status=failed");
    for (const it of failed) await api(`/api/items/${it.id}/action`, { action: "retry" });
    toast(`${failed.length} 条已重新排队，开始处理`); await refreshState(); renderProcessLive();
  });
  $("#stopBtn") && ($("#stopBtn").onclick = () => api("/api/stop", {}));
  $("#goBtn") && ($("#goBtn").onclick = async () => { await api("/api/process", {}); refreshState().then(renderProcessLive); });

  $("#tabs").innerHTML = TABS.map(([k, label, ss]) => {
    const n = ss.reduce((a, s) => a + (st[s] || 0), 0);
    return `<button data-k="${k}" class="${procTab === k ? "on" : ""}">${label} ${n ? `(${n})` : ""}</button>`;
  }).join("");
  $$("#tabs button").forEach((b) => b.onclick = () => { procTab = b.dataset.k; renderProcessLive(); });

  const ss = TABS.find((t) => t[0] === procTab)[2];
  const items = await api("/api/items?status=" + ss.join(","));
  $("#qlist").innerHTML = items.length ? items.slice(0, 300).map((it) => {
    const [label, cls] = STATUS[it.status] || [it.status, "gray"];
    let btns = "";
    if (it.status === "failed") btns = `<button class="btn sm" data-a="retry" data-id="${it.id}">重试</button>`;
    if (it.status === "need_key") btns = `<button class="btn sm" data-a="reextract" data-id="${it.id}">提炼</button>`;
    if (it.status === "irrelevant") btns = `<button class="btn sm" data-a="include" data-id="${it.id}">收进收藏库</button>`;
    if (["failed", "skipped", "irrelevant", "need_key", "queued"].includes(it.status)) btns += ` <button class="btn sm ghost" data-a="delete" data-id="${it.id}">删除</button>`;
    return `<div class="qrow"><div style="min-width:0">
        <div class="t"><a href="#/item/${it.id}" style="color:inherit">${esc(it.note_title || it.title || it.url || "（解析中）")}</a></div>
        <div class="r"><span class="chip ${cls}">${label}</span> ${esc(it.reason || "")}</div></div>
        <div class="row">${btns}</div></div>`;
  }).join("") : `<div class="empty" style="padding:30px">这里是空的</div>`;
  $$("#qlist [data-a]").forEach((b) => b.onclick = async () => {
    const a = b.dataset.a;
    if (a === "delete" && !confirm("删除这条？")) return;
    await api(`/api/items/${b.dataset.id}/action`, { action: a });
    await refreshState(); renderProcessLive();
  });
  if (procTab === "need_key" && items.length > 1 && STATE.settings.api_key_set) {
    $("#qlist").insertAdjacentHTML("afterbegin", `<div class="row" style="padding:8px 4px"><span class="muted small">AI Key 已填好，可以一次全部提炼</span><span class="spacer"></span><button class="btn sm primary" id="allRe">全部提炼</button></div>`);
    $("#allRe").onclick = async () => { for (const it of items) await api(`/api/items/${it.id}/action`, { action: "reextract" }); toast("已全部加入队列"); };
  }
  if (procTab === "failed" && items.length >= 1) {
    $("#qlist").insertAdjacentHTML("afterbegin", `<div class="row" style="padding:8px 4px"><span class="spacer"></span><button class="btn sm" id="allRetry">全部重试</button></div>`);
    $("#allRetry").onclick = async () => { for (const it of items) await api(`/api/items/${it.id}/action`, { action: "retry" }); toast("已全部重新排队，开始处理"); await refreshState(); renderProcessLive(); };
  }
  const logs = $("#logs");
  const atBottom = logs.scrollTop + logs.clientHeight >= logs.scrollHeight - 20;
  logs.innerHTML = (STATE.logs || []).map((l) => `<div><span>${fmtTime(l.t)}</span>${esc(l.msg)}</div>`).join("") || `<div class="muted">暂无日志</div>`;
  if (atBottom) logs.scrollTop = logs.scrollHeight;
}

/* ---------------------------------------------------------------- 设置 */
let settingsTab = "ai";   // 设置页当前标签：ai / asr / store / rules
async function renderSettings() {
  await refreshState();
  const s = STATE.settings, P = STATE.providers;
  const TAB = [["ai", "AI 提炼"], ["asr", "语音转文字"], ["store", "存储与备份"], ["rules", "处理规则"]];
  view.innerHTML = `
    <div class="head">
      <div><h1>设置</h1><div class="muted">所有设置和数据都只保存在你自己的电脑上</div></div>
      <div class="spacer"></div>
      ${s.api_key_set ? `<button class="btn ghost" id="clearKey">清除已保存的 Key</button>` : ""}
      <button class="btn primary" id="saveBtn">保存设置</button>
    </div>
    <div class="tabs stab" id="stabs">${TAB.map(([k, l]) => `<button data-st="${k}" class="${settingsTab === k ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="pane" data-pane="ai" ${settingsTab === "ai" ? "" : "hidden"}>
    <div class="card form">
      <h2>AI 提炼</h2>
      <div class="grid2">
        <div class="field"><label>AI 服务商</label><select id="provider">${Object.entries(P).map(([k, v]) => `<option value="${k}" ${s.provider === k ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select>
          <div class="hint" id="keyLink"></div></div>
        <div class="field"><label>API Key ${s.api_key_set ? `<span class="chip teal">已保存 ${esc(s.api_key_hint)}</span>` : ""}</label>
          <input id="apiKey" type="password" placeholder="${s.api_key_set ? "留空表示不修改" : "sk-..."}" autocomplete="off">
          <div class="hint">Key 只存在本机 data/settings.json，不会上传到别处。</div></div>
        <div class="field"><label>接口地址（Base URL）</label><input id="baseUrl" value="${esc(s.base_url)}"></div>
        <div class="field"><label>模型</label><div class="model-pick"><input id="model" value="${esc(s.model)}" placeholder="选择或输入模型名" autocomplete="off">
          <select id="modelPick" title="从列表选择模型"></select></div>
          <div class="hint"><span id="mHint">点右边的箭头从列表选择；也可以直接输入。</span> <a href="javascript:void 0" id="mLoad">刷新模型列表</a></div></div>
      </div>
      <div class="row"><button class="btn" id="testBtn">测试连接</button><span class="small" id="testRes"></span>
        <span class="spacer"></span><span class="muted small">累计消耗约 ${(s.tokens_used || 0).toLocaleString()} tokens</span></div>
    </div>
    ${freePlanHtml(s)}
    </div>

    <div class="pane" data-pane="asr" ${settingsTab === "asr" ? "" : "hidden"}>
    <div class="card form">
      <h2>语音转文字（在本机运行）</h2>
      <div class="grid2">
        <div class="field"><label>识别引擎</label><select id="engine">
          ${[["auto", "自动（苹果芯片 Mac 用加速版，其他用通用版）"], ["mlx", "Mac 加速版（mlx-whisper large-v3-turbo）"], ["faster", "通用版（faster-whisper）"]]
            .map(([k, l]) => `<option value="${k}" ${s.asr_engine === k ? "selected" : ""}>${l}</option>`).join("")}</select>
          <div class="hint">${STATE.asr.apple_silicon ? (STATE.asr.mlx_available ? "✓ 检测到苹果芯片，Mac 加速版可用（第一次会下载约 1.6GB 模型）" : "检测到苹果芯片，但还没装加速组件：请重新运行一次安装脚本") : "这台电脑用通用版"}</div></div>
        <div class="field"><label class="check" style="margin-top:26px"><input type="checkbox" id="useSubs" ${s.use_subtitles ? "checked" : ""}> 视频自带字幕时直接用字幕（更快，跳过下载和转写）</label></div>
        <div class="field"><label>通用版的模型大小</label><select id="wm">
          ${[["tiny", "tiny：最快，准确率低"], ["base", "base：较快，够用"], ["small", "small：推荐，准确率和速度平衡"], ["medium", "medium：更准，但慢很多"]]
            .map(([k, l]) => `<option value="${k}" ${s.whisper_model === k ? "selected" : ""}>${l}</option>`).join("")}</select>
          <div class="hint">只在用通用版时生效。第一次使用会自动下载（small 约 480MB）。</div></div>
        <div class="field"><label>超长视频只转录前几分钟</label><input id="maxMin" type="number" min="1" max="120" value="${s.max_minutes}"></div>
      </div>
      <div class="field"><label>图片文字识别（图文用）</label>
        <div class="${STATE.ocr?.backend ? "" : "banner warn"}" style="${STATE.ocr?.backend ? "" : "margin:0"}">${STATE.ocr?.backend ? `✓ ${esc(STATE.ocr.label)}（在本机运行，图片不上传）` : "还没安装文字识别组件：请重新运行一次安装脚本。没装的话，图文只会用正文文字。"}</div></div>
      <div class="field"><label class="check"><input type="checkbox" id="mirror" ${s.use_hf_mirror ? "checked" : ""}> 使用国内镜像下载模型（人在中国大陆时勾选；在海外不要勾）</label></div>
    </div>
    </div>

    <div class="pane" data-pane="store" ${settingsTab === "store" ? "" : "hidden"}>
    <div class="card form">
      <h2>存储</h2>
      <div class="field"><label>笔记保存位置（可以直接用 Obsidian 打开这个文件夹；留空 = 默认位置）</label>
        <div class="row"><input id="libDir" value="${esc(s.library_dir)}" placeholder="${esc(STATE.library_dir)}" style="flex:1"><button class="btn" id="openLib">打开文件夹</button></div></div>
      <div class="field"><label class="check"><input type="checkbox" id="keepVideo" ${s.keep_video ? "checked" : ""}> 转录后保留视频文件（默认删除，节省空间）</label></div>
      <div class="field"><label>用哪个浏览器登录抖音</label><select id="browser">
        ${[["auto", "自动（先找 Edge，再找 Chrome）"], ["msedge", "Microsoft Edge"], ["chrome", "Google Chrome"], ["chromium", "内置 Chromium（需单独安装）"]]
          .map(([k, l]) => `<option value="${k}" ${s.browser === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    </div>
    <div class="card form" style="margin-bottom:16px" id="backupCard">
      <h2>备份与恢复</h2>
      <p class="muted" style="margin:-6px 0 0">把全部数据（笔记、文字稿、文件夹、设置）打包成一个文件。换电脑时，在新电脑上装好学习台，导入这个文件就恢复原样。
        抖音登录状态和语音模型不打包：换电脑后重新扫码、模型会自动重新下载。</p>
      <div class="row" style="gap:12px">
        <a class="btn primary" id="bkDown" href="/api/backup?keys=1">${ico("download")}下载完整备份</a>
        <label class="check small"><input type="checkbox" id="bkKeys" checked style="accent-color:var(--accent)"> 备份里包含 AI Key</label>
        <span class="spacer"></span>
        <label class="btn" for="bkFile">恢复备份…</label>
        <input type="file" id="bkFile" accept=".zip,application/zip" hidden>
      </div>
      <div class="hint" id="bkHint">备份文件里如果包含 AI Key，请当作密码一样保管，别发给别人。恢复会覆盖当前数据，恢复前程序会先自动把当前数据备份一份。</div>
      <div id="bkAuto"></div>
    </div>
    </div>

    <div class="pane" data-pane="rules" ${settingsTab === "rules" ? "" : "hidden"}>
    <div class="card form">
      <h2>分类规则</h2>
      <p class="muted" style="margin:-6px 0 0">说说你心里的分法：什么内容该进哪个文件夹。这段会被带进两处判断——新视频提炼时，以及「待分类」里点 AI 自动归类时。</p>
      <div class="field"><label>我想要的归法</label>
        <textarea id="folderRules" rows="9" placeholder="一行一条，用 → 隔开「什么内容」和「文件夹名」。不会写就点下面那个按钮。">${esc(s.folder_rules)}</textarea>
        <div class="hint">不写也行，但那样它只能照文件夹名字猜；写了它才按你的说法挑。</div></div>
      <div class="field"><label>怎么写才管用</label>
        <div class="hint">
          · 一行一条，左边写「什么内容」，右边写「文件夹名」，中间用 → 隔开<br>
          · 右边的名字要和左侧栏里的一字不差，对不上它就只能放空<br>
          · 记得加一条「同时符合两条时怎么办」，它最容易卡在这里<br>
          · 只对之后新提炼的、以及之后点自动归类的生效；已经归好的不会被挪动
        </div></div>
      <div class="row"><button class="btn" id="rulesDemo">插入示例格式</button><span class="small muted">用你现有的文件夹名套一份，插进去再改。</span></div>
    </div>
    <div class="card form">
      <h2>主题筛选 <span class="chip gray">已停用</span></h2>
      <p class="muted" style="margin:-6px 0 0">这块现在不参与任何判断：AI 不再因为「跟主题无关」把视频收起来，有实质内容的都会进收藏库。</p>
      <div class="field"><label>我关注的主题（仅存档）</label>
        <textarea id="focus" rows="2" class="off">${esc(s.focus_topic)}</textarea>
        <div class="hint">内容照常保存，将来想重新启用就能接着用。</div></div>
    </div>
    </div>`;

  const showKeyLink = () => {
    const p = P[$("#provider").value];
    $("#keyLink").innerHTML = p.key_url ? `<a href="${esc(p.key_url)}" target="_blank" rel="noopener">去 ${esc(p.name)} 申请 Key →</a>` : "填写任意 OpenAI 兼容接口的地址和模型名";
  };
  showKeyLink();
  // 标签页切换：只切显示，不重绘，免得没保存的输入被冲掉
  $$("#stabs button").forEach((b) => b.onclick = () => {
    settingsTab = b.dataset.st;
    $$("#stabs button").forEach((x) => x.classList.toggle("on", x === b));
    $$(".pane").forEach((p) => { p.hidden = p.dataset.pane !== settingsTab; });
  });
  $("#provider").onchange = () => {
    const p = P[$("#provider").value];
    if (p.base_url) { $("#baseUrl").value = p.base_url; $("#model").value = p.model; }
    modelCache.main = null; fillPick("modelPick", "model", p.models || [p.model].filter(Boolean), "mHint", false);
    showKeyLink();
  };
  $("#testBtn").onclick = async () => {
    $("#testRes").textContent = "测试中…";
    const r = await api("/api/test_llm", { provider: $("#provider").value, base_url: $("#baseUrl").value, model: $("#model").value, api_key: $("#apiKey").value });
    if (r.ok) {
      if (r.models?.length) modelCache.main = r.models;
      toast("连接成功，已自动保存");
      await renderSettings();
      $("#testRes").innerHTML = `<span style="color:var(--ok)">✓ 连接成功，已保存（AI 回复：${esc(r.reply)}）</span>`;
    } else $("#testRes").innerHTML = `<span style="color:var(--bad)">✗ ${esc(r.error)}</span>`;
  };
  // 模型下拉：有缓存用缓存，没有就用预设，并在后台去服务商拉一次真实列表
  const initPick = (pickId, inputId, hintId, provId, loadId) => {
    const p = P[$("#" + provId).value] || {};
    const cached = modelCache.main;
    fillPick(pickId, inputId, cached || p.models || [], hintId, !!cached);
    const load = async (quiet) => {
      try {
        const r = await api("/api/models", { provider: $("#provider").value, base_url: $("#baseUrl").value, api_key: $("#apiKey").value });
        modelCache.main = r.models; fillPick(pickId, inputId, r.models, hintId, true);
        if (!quiet) toast(`读取到 ${r.models.length} 个模型`);
      } catch (e) { if (!quiet) toast(e.message, 4000); }
    };
    $("#" + loadId).onclick = () => load(false);
    if (!cached && s.api_key_set) load(true);
  };
  initPick("modelPick", "model", "mHint", "provider", "mLoad");
  setupBackup();
  setupFreePlan();
  /* 分类规则：一键塞一份清单式示例，名字尽量在现有文件夹里找对得上的 */
  $("#rulesDemo").onclick = () => {
    const ta = $("#folderRules");
    if (ta.value.trim() && !confirm("文本框里已经有内容了，用示例覆盖吗？")) return;
    const n = (STATE.folders || []).map((f) => f.name);
    const pick = (kw, d) => n.find((x) => kw.some((k) => x.includes(k))) || d;
    ta.value = [
      `- 讲原理、讲某个东西内部怎么运作的 → ${pick(["原理", "科普", "基础"], "（换成你的文件夹名）")}`,
      `- 具体软件、插件、网站怎么操作的 → ${pick(["工具", "技术", "实操", "软件"], "（换成你的文件夹名）")}`,
      `- 身体、疾病、饮食、运动这类 → ${pick(["健康", "健身", "运动", "养生"], "（换成你的文件夹名）")}`,
      `- 同时符合上面两条的，放更具体的那个`,
      `- 实在判断不出来的，留空，我自己分`,
    ].join("\n");
    ta.focus();
    toast("已填入示例，把不对的改掉再保存");
  };
  $("#openLib").onclick = () => api("/api/open", { what: "library" }).catch((e) => toast(e.message));
  $("#clearKey") && ($("#clearKey").onclick = async () => { if (confirm("清除已保存的 API Key？")) { await api("/api/settings", { clear_key: true }); toast("已清除"); renderSettings(); } });
  $("#saveBtn").onclick = async () => {
    await api("/api/settings", {
      provider: $("#provider").value, base_url: $("#baseUrl").value.trim(), model: $("#model").value.trim(), api_key: $("#apiKey").value.trim(),
      focus_topic: $("#focus").value.trim(), folder_rules: $("#folderRules").value.trim(),
      whisper_model: $("#wm").value, asr_engine: $("#engine").value, use_subtitles: $("#useSubs").checked, max_minutes: +$("#maxMin").value, use_hf_mirror: $("#mirror").checked,
      keep_video: $("#keepVideo").checked, library_dir: $("#libDir").value.trim(), browser: $("#browser").value, welcome_done: true,
    });
    toast("已保存"); renderSettings();
  };
}

/* ---------------------------------------------------------------- 启动 */
(async () => {
  await refreshState();
  if (!location.hash) location.hash = STATE.settings.api_key_set || STATE.stats.total ? "#/library" : "#/settings";
  render();
  startPolling();
})();

/* ---------------------------------------------------------------- 备份与恢复 */
const fmtSize = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";

async function setupBackup() {
  const keys = $("#bkKeys"), down = $("#bkDown");
  keys.onchange = () => { down.href = "/api/backup?keys=" + (keys.checked ? "1" : "0"); };
  down.onclick = () => toast("正在打包备份，稍等几秒浏览器就会开始下载");
  $("#bkFile").onchange = async (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (!file) return;
    try {
      toast("正在检查备份文件……");
      const r1 = await fetch("/api/restore?dry=1", { method: "POST", body: file });
      const m = await r1.json();
      if (!r1.ok) throw new Error(m.error || "检查失败");
      const msg = `要从这个备份恢复吗？\n\n备份时间：${m.created}\n视频：${m.items} 条（笔记 ${m.done} 条，已学 ${m.learned} 条）\nMarkdown 笔记文件：${m.notes_in_zip} 个\n${m.has_keys ? "包含 AI Key" : "不含 AI Key（会保留你现在的 Key）"}\n\n恢复会覆盖当前数据；当前数据会先自动备份一份，选错了还能找回。`;
      if (!confirm(msg)) return;
      toast("正在恢复……", 10000);
      const r2 = await fetch("/api/restore", { method: "POST", body: file });
      const res = await r2.json();
      if (!r2.ok) throw new Error(res.error || "恢复失败");
      toast(`✓ 恢复完成：${res.items} 条视频，${res.done} 条笔记`, 4000);
      await refreshState(); renderSettings();
    } catch (err) { toast(err.message, 5000); }
  };
  try {
    const r = await api("/api/backups");
    if (r.files.length) {
      $("#bkAuto").innerHTML = `<details style="margin-top:4px"><summary class="small">恢复前的自动备份（${r.files.length} 个，可以用来撤销恢复）</summary>
        <div class="qlist" style="margin-top:8px">${r.files.map((f) => `<div class="qrow"><div><div class="t">${esc(f.name)}</div>
          <div class="r">${new Date(f.mtime * 1000).toLocaleString("zh-CN", { hour12: false })} · ${fmtSize(f.size)}</div></div>
          <button class="btn sm" data-auto="${esc(f.name)}">恢复到这个</button></div>`).join("")}</div>
        <div class="hint">保存在 ${esc(r.dir)}，只保留最近 5 个。</div></details>`;
      $$("[data-auto]").forEach((b) => b.onclick = async () => {
        if (!confirm("恢复到这个自动备份？当前数据同样会先自动备份一份。")) return;
        try { const res = await api("/api/restore_auto", { name: b.dataset.auto }); toast(`✓ 已恢复：${res.items} 条视频`); await refreshState(); renderSettings(); }
        catch (e) { toast(e.message, 5000); }
      });
    }
  } catch {}
}

/* ---------------------------------------------------------------- 模型下拉 */
const modelCache = { main: null, deep: null };
function fillPick(pickId, inputId, models, hintId, live) {
  const sel = $("#" + pickId), inp = $("#" + inputId);
  if (!sel) return;
  const cur = inp.value.trim();
  const list = [...new Set([...(models || []), cur].filter(Boolean))];
  sel.innerHTML = `<option value="">${list.length ? "选择…" : "无列表"}</option>` + list.map((m) => `<option value="${esc(m)}" ${m === cur ? "selected" : ""}>${esc(m)}</option>`).join("");
  sel.onchange = () => { if (sel.value) { inp.value = sel.value; toast(`已选择 ${sel.value}，记得点「测试连接」或「保存设置」`); } };
  const h = $("#" + hintId);
  if (h) h.textContent = live ? `已从服务商读取到 ${models.length} 个可用模型，点右边的箭头选择。` : "点右边的箭头从常用模型里选；填好 Key 后会自动读取完整列表。";
}

/* ---------------------------------------------------------------- 图文：画廊与大图 */
function galleryHtml(images) {
  return `<div class="gallery">${images.map((src, i) => `<img src="/files/${encodeURI(src)}" data-g="${i}" loading="lazy" alt="图 ${i + 1}">`).join("")}</div>`;
}
function bindGallery(root, images) {
  if (!images?.length) return;
  $$("[data-g]", root).forEach((img) => img.onclick = () => openLightbox(images, +img.dataset.g));
}
function openLightbox(images, idx) {
  let box = $("#lightbox");
  if (!box) {
    box = document.createElement("div"); box.id = "lightbox"; box.className = "lightbox";
    box.innerHTML = `<button class="lb-btn lb-close" title="关闭 (Esc)">${ico("x")}</button><button class="lb-btn lb-prev" title="上一张 (←)">‹</button>
      <img alt=""><button class="lb-btn lb-next" title="下一张 (→)">›</button><div class="lb-count"></div>`;
    document.body.appendChild(box);
  }
  const show = () => {
    idx = (idx + images.length) % images.length;
    $("img", box).src = "/files/" + encodeURI(images[idx]);
    $(".lb-count", box).textContent = `${idx + 1} / ${images.length}`;
    $(".lb-prev", box).hidden = $(".lb-next", box).hidden = images.length < 2;
  };
  const close = () => { box.hidden = true; document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowLeft") { idx--; show(); } if (e.key === "ArrowRight") { idx++; show(); } };
  $(".lb-close", box).onclick = close;
  $(".lb-prev", box).onclick = (e) => { e.stopPropagation(); idx--; show(); };
  $(".lb-next", box).onclick = (e) => { e.stopPropagation(); idx++; show(); };
  box.onclick = (e) => { if (e.target === box) close(); };
  document.addEventListener("keydown", onKey);
  box.hidden = false; show();
}

/* ---------------------------------------------------------------- 免费方案 */
let freePick = null;
function freePlanHtml(s) {
  const FP = STATE.free_plans || {};
  const cur = s.free_plan && FP[s.free_plan];
  return `<div class="card form free-card" style="margin-bottom:16px" id="freeCard">
    <div class="row"><h2 style="margin:0">免费方案</h2><span class="chip">推荐新手</span><span class="spacer"></span>
      ${cur ? `<span class="chip teal">✓ 正在使用：${esc(cur.name)} · ${esc(s.model)}</span>` : ""}</div>
    <p class="muted" style="margin:-6px 0 0">用你自己账号的免费额度，不花钱。免费模型够日常提炼用；想要更稳的效果，可以到「AI 提炼」里换成付费模型。</p>
    <div class="plans">${Object.entries(FP).map(([k, p]) => `
      <button class="plan ${freePick === k ? "on" : ""} ${s.free_plan === k ? "using" : ""}" data-plan="${k}">
        <div class="row" style="gap:6px"><b>${esc(p.name)}</b><span class="chip ${p.tag === "海外" ? "gray" : ""}">${esc(p.tag)}</span></div>
        <div class="muted small">${esc(p.desc)}</div></button>`).join("")}</div>
    <div id="freeSteps"></div>
  </div>`;
}
function setupFreePlan() {
  $$("#freeCard [data-plan]").forEach((b) => b.onclick = () => {
    freePick = b.dataset.plan;
    $$("#freeCard .plan").forEach((x) => x.classList.toggle("on", x === b));
    renderFreeSteps();
  });
  if (freePick) renderFreeSteps();
}
function renderFreeSteps() {
  const p = STATE.free_plans[freePick];
  $("#freeSteps").innerHTML = `<ol class="free-steps">
      <li><b>注册 / 登录</b>：<a href="${esc(p.signup)}" target="_blank" rel="noopener">打开 ${esc(p.name)} 官网 →</a></li>
      <li><b>创建 API Key 并复制</b>：<a href="${esc(p.key_url)}" target="_blank" rel="noopener">打开 API Key 页面 →</a>（点「创建」/「新建 API Key」，然后复制）</li>
      <li><b>粘贴到这里，点一键配置</b>
        <div class="row" style="margin-top:8px"><input id="freeKey" class="search" type="password" placeholder="粘贴 ${esc(p.name)} 的 API Key" autocomplete="off" style="flex:1">
          <button class="btn primary" id="freeGo">一键配置</button></div>
        <div class="small" id="freeRes" style="margin-top:8px"></div></li>
    </ol>`;
  $("#freeGo").onclick = async () => {
    const key = $("#freeKey").value.trim();
    if (!key) return toast("先把 Key 粘贴进来");
    $("#freeGo").disabled = true; $("#freeRes").innerHTML = `<span class="muted">正在测试并挑选免费模型……</span>`;
    try {
      const r = await api("/api/free_setup", { plan: freePick, api_key: key });
      toast(`配置好了：${r.name} · ${r.model}`, 3500);
      freePick = null; modelCache.main = null;
      await renderSettings();
    } catch (e) {
      $("#freeRes").innerHTML = `<span style="color:var(--bad)">✗ ${esc(e.message)}</span>`;
      $("#freeGo").disabled = false;
    }
  };
}

/* ---------------------------------------------------------------- 空状态与骨架屏 */
function emptyHtml(icon, title, desc, actions = "") {
  return `<div class="empty-state" style="grid-column:1/-1">
    <div class="es-art">${ico(icon, "ic es-ic")}</div>
    <h3>${title}</h3><p class="muted">${desc}</p>
    ${actions ? `<div class="row" style="justify-content:center;margin-top:6px">${actions}</div>` : ""}</div>`;
}
function skeletonLibrary() {
  const card = `<div class="sk-card"><div class="sk sk-cover"></div><div class="sk-body"><div class="sk sk-line w80"></div><div class="sk sk-line"></div><div class="sk sk-line w60"></div></div></div>`;
  return `<div class="head"><div><div class="sk sk-h1"></div><div class="sk sk-line w40"></div></div></div>
    <div class="sk sk-block"></div><div class="grid">${card.repeat(6)}</div>`;
}
function skeletonItem() {
  return `<div class="detail"><div><div class="sk sk-line w20" style="margin-bottom:22px"></div><div class="sk sk-h1 w70"></div>
      <div class="sk sk-line w30"></div><div class="sk sk-block" style="height:110px;margin-top:34px"></div>
      <div class="sk sk-block" style="height:220px"></div></div>
    <div><div class="sk sk-block" style="aspect-ratio:16/10;height:auto"></div><div class="sk sk-line"></div><div class="sk sk-line w60"></div></div></div>`;
}
