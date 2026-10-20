// 白小纯修仙工具插件 - DSH (Cordis) 插件
// 把白小纯的能力封装为 DSH 可用工具：今日灵签/灵气检测/修为汇报
// 格式对齐官方 dsh-tool-todo：ESM + defineTool + export {Config, apply, inject, name}

import { defineTool } from "@deepseek-ai/dsh-tools";

export const name = "tool-baixiaochun";
export const inject = ["tools"];

// 今日灵签：随机箴言（脱敏版，无个人数据）
function drawFortune() {
  const fortunes = [
    { sign: "上上签", text: "今日宜下推，忌空谈。机缘在行动里，不在计划里。", act: "cheer" },
    { sign: "上签", text: "灵气渐聚，根基渐稳。适合写代码，不宜熬夜。", act: "nod" },
    { sign: "中签", text: "时运平缓，宜蓄力。先把眼前的事做完，再想远方。", act: "think" },
    { sign: "中平签", text: "万事讲究个火候，急不得。改完这处，歇口气。", act: "sit" },
    { sign: "下签", text: "心魔暗涌，注意休息。路要一步步走，今天也能到。", act: "panic" },
    { sign: "上上签", text: "心之所向，素履以往。今日正是破局之时，莫犹豫。", act: "jump" },
  ];
  return fortunes[Math.floor(Math.random() * fortunes.length)];
}

// 灵气检测：检测 DSH 服务状态（通过端口探测）
async function checkLingqi() {
  try {
    const http = await import("node:http");
    const url = process.env.DSH_WEB_URL || "http://127.0.0.1:3080";
    return await new Promise((resolve) => {
      const req = http.get(url, { timeout: 3000 }, (res) => {
        res.resume();
        // 任何 HTTP 响应都说明监听者活着：401/403 是认证态，不是死亡
        resolve({ alive: true, status: res.statusCode });
      });
      req.on("error", () => resolve({ alive: false }));
      req.on("timeout", () => { req.destroy(); resolve({ alive: false }); });
    });
  } catch (e) {
    return { alive: false };
  }
}

// 桌宠显示控制：通过本地控制端口指挥 Electron 桌宠壳（pet.html）显示/隐藏
// 通道：POST http://127.0.0.1:{DSH_PET_CTL_PORT|3090}/pet {action}
// 壳未运行（如直接用浏览器开 DSH、没启动桌面壳）时返回 shell-not-running
async function controlPet(action) {
  try {
    const http = await import("node:http");
    const port = process.env.DSH_PET_CTL_PORT || "3090";
    const url = `http://127.0.0.1:${port}/pet`;
    const body = JSON.stringify({ action });
    return await new Promise((resolve) => {
      const req = http.request(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 3000,
      }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve({ ok: true, ...JSON.parse(data) }); }
          catch (e) { resolve({ ok: false, error: "bad-response" }); }
        });
      });
      req.on("error", () => resolve({
        ok: false,
        error: "shell-not-running",
        hint: "白小纯桌宠壳未运行（需通过桌面壳启动 DSH，或用托盘/快捷键 Ctrl+Alt+B 操作），无法控制显示",
      }));
      req.on("timeout", () => { req.destroy(); resolve({ ok: false, error: "timeout" }); });
      req.end(body);
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// 修为汇报：读 session 统计
async function checkXiuwei() {
  try {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const cachePath = path.join(process.env.DSH_HOME || path.join(os.homedir(), ".dsh"), "storages", "session_projcache.json");
    const raw = fs.readFileSync(cachePath, "utf8");
    const json = JSON.parse(raw);
    const sessions = json.tables?.sessions || {};
    const sid = process.env.DSH_SESSION_ID;
    // 只按当前会话取；绝不回退到“第一个键”（会读到别的项目的历史会话）
    const key = Object.keys(sessions).find(
      (k) => k === sid || k === String(sid).replace(/^session-/, ""),
    );
    const s = key ? sessions[key] : null;
    if (!s) return { ok: false, reason: "current-session-not-projected", sessionId: sid ?? null };
    const stats = s.rows?.sessionStats?.val;
    const tu = s.rows?.tokenUsage?.val;
    return {
      ok: true,
      sessionId: key,
      turns: stats?.turns ?? 0,
      steps: stats?.steps ?? 0,
      outputTokens: tu?.totals?.outputTokens ?? 0,
      cacheRead: tu?.totals?.cacheReadTokens ?? 0,
      uncached: tu?.totals?.uncachedInputTokens ?? 0,
    };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// 工具定义（对齐官方 defineTool 格式）
const tool = defineTool({
  name: "baixiaochun",
  description: "白小纯修仙工具 —— 灵溪宗修士白小纯的四项能力，全部脱敏、无个人数据：" +
    "1. fortune：今日灵签（抽一签，返回 sign + text + act）" +
    "2. lingqi：灵气检测（检测 DSH 服务是否运行，返回 alive）" +
    "3. xiuwei：修为汇报（读取当前会话统计：轮次/步数/token/缓存命中率）" +
    "4. show/hide/toggle/pet-status：桌宠显示控制（调出/关闭/切换/查询白小纯桌宠的显示；需桌面壳运行，否则返回 shell-not-running）" +
    "用法：调用时指定 cmd 参数：'fortune' / 'lingqi' / 'xiuwei' / 'show' / 'hide' / 'toggle' / 'pet-status'",
  parameters: {
    cmd: {
      type: "string",
      required: true,
      description: "执行命令：'fortune' 今日灵签 / 'lingqi' 灵气检测 / 'xiuwei' 修为汇报 / 'show' 调出桌宠 / 'hide' 关闭桌宠显示 / 'toggle' 切换显示 / 'pet-status' 查询桌宠显示状态",
    },
  },
  output: {
    schema: { type: "json" },
    render(args, value) {
      return [{ type: "text", text: JSON.stringify(value) }];
    },
  },
  async execute(args, exec) {
    const cmd = args && args.cmd;
    if (cmd === "fortune") {
      const f = drawFortune();
      return { ok: true, type: "fortune", sign: f.sign, text: f.text, act: f.act };
    }
    if (cmd === "lingqi") {
      const st = await checkLingqi();
      return { ok: true, type: "lingqi", alive: st.alive, status: st.status ?? null };
    }
    if (cmd === "xiuwei") {
      const st = await checkXiuwei();
      return { ok: true, type: "xiuwei", ...st };
    }
    if (["show", "hide", "toggle", "pet-status"].includes(cmd)) {
      const action = cmd === "pet-status" ? "status" : cmd;
      const r = await controlPet(action);
      return {
        ok: r.ok,
        type: "pet",
        action,
        visible: typeof r.visible === "boolean" ? r.visible : null,
        error: r.error || null,
        hint: r.hint || null,
      };
    }
    return {
      ok: false,
      error: "unknown cmd. 用法：baixiaochun { cmd: 'fortune' | 'lingqi' | 'xiuwei' | 'show' | 'hide' | 'toggle' | 'pet-status' }",
    };
  },
});

// Cordis 插件导出（ESM，对齐官方 dsh-tool-todo：直接 ctx.tools.register）
export function apply(ctx) {
  ctx.tools.register(tool);
}
