# Novel-Translator

**NovaTranslate AI Pro** — 面向小说/轻小说/连载网文的多模型 AI 翻译工作台。支持粘贴超长文本或直接上传章节截图，由大模型完成 OCR 识别、排版还原与整章翻译，译文可在界面内直接校对并导出 TXT。

[![在线体验](https://img.shields.io/badge/Live%20Demo-novel--translator--lemon.vercel.app-0078d4)](https://novel-translator-lemon.vercel.app)
![Language](https://img.shields.io/badge/lang-TypeScript-3178c6)
![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20Vite%206%20%2B%20Express-61dafb)

---

## 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [界面结构](#界面结构)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [部署到 Vercel](#部署到-vercel)
- [API 说明](#api-说明)
- [项目结构](#项目结构)
- [使用技巧](#使用技巧)
- [常见问题](#常见问题)
- [安全说明](#安全说明)
- [许可证](#许可证)

---

## 项目简介

小说翻译与普通文本翻译的诉求并不一样：它需要**长上下文一致性**、**人物名与专有名词统一**、**原文断句与分段习惯的保留**，以及**对话与叙述语感的区分**。市面上通用翻译工具在这几点上往往力不从心——换一章就换一个译名，段落被压成一整块，语气也变得像产品说明书。

Novel-Translator 把这些需求收进一个开源工作台里：

- **多模型可切换**：Google Gemini、DeepSeek，以及任何 OpenAI 兼容端点（自建中转、本地 Ollama 等）；
- **图片直接进翻译**：章节截图不必先手动 OCR，交给具备视觉能力的模型一次完成「识别 → 排版 → 翻译」；
- **术语表约束**：用 `原名 -> 译名` 的映射锁死人名、地名、招式名，跨章节保持一致；
- **风格预设**：用自然语言描述文风（如「专业、流畅，保留小说原有氛围与断句习惯」），作为系统指令下发；
- **本地留存**：配置、原文、译文都存在浏览器 `localStorage`，刷新不丢稿，数据不经第三方服务器中转。

---

## 核心特性

| 特性 | 说明 |
|---|---|
| 📝 双输入模式 | 「文本」模式支持超长原文粘贴；「图片」模式支持拖拽 / 点击上传章节截图 |
| 🖼️ 视觉识别翻译 | 图片交由 Gemini 视觉模型直接处理，自动提取文字、还原章节结构后翻译 |
| 🤖 多厂商模型 | Gemini 3 Flash / 3.5 Flash / 2.5 Flash，DeepSeek V4 Flash / V4 Pro |
| 🔌 OpenAI 兼容 | 厂商选「OpenAI 兼容 / 自定义」，可自定义 Base URL 与模型名，接入任意兼容端点 |
| 🔑 密钥本地管理 | 各厂商 API Key 分栏保存，密码框输入，仅存于本机浏览器 |
| 🧪 连接自检 | 一键「测试连接」，用最小请求验证 Key、端点与模型是否可用 |
| 📖 术语表锁定 | 支持 `King's Landing -> 君临城` 形式的对照表，逐条进入提示词 |
| 🎨 风格预设 | 默认预设「专业、流畅，保留小说原有氛围与断句习惯」，可自由改写 |
| ✏️ 译文可校对 | 右侧译文区是可直接编辑的文本域，边读边改，无需导出再改 |
| 💾 一键导出 | 译文导出为 UTF-8 编码的 `.txt`，文件名带时间戳 |
| 🔄 状态持久化 | 设置、模式、原文、译文全部落 `localStorage` |
| ⚡ 双后端形态 | 本地开发走 Express（`server.ts`），线上走 Vercel Serverless Function（`api/index.ts`） |

---

## 界面结构

采用三栏工作台布局，配色与交互节奏参照 Office / Fluent 设计语言：

```
┌──────────────────────────────────────────────────────────────────┐
│  ▶ NovaTranslate AI Pro        [错误提示] [API 状态] [开始翻译]   │
├──────────────┬────────────────────────┬──────────────────────────┤
│              │  原文文本   [文本|图片] │  AI 实时译文  [导出 TXT] │
│  AI 模型配置 │  ┌──────────────────┐  │  ┌────────────────────┐  │
│  API 密钥    │  │                  │  │  │                    │  │
│  翻译风格    │  │  原文输入 / 上传 │  │  │  译文（可编辑）    │  │
│  术语表      │  │                  │  │  │                    │  │
│              │  └──────────────────┘  │  └────────────────────┘  │
├──────────────┴────────────────────────┴──────────────────────────┤
│  NovaTranslate AI Pro Workspace          UTF-8     ● 就绪 / 处理中│
└──────────────────────────────────────────────────────────────────┘
```

- **左侧边栏 `Sidebar.tsx`**：模型厂商与模型选择、自定义 Base URL、API Key 输入与连接测试、翻译风格预设、术语表 / 禁忌词。
- **源文面板 `SourcePanel.tsx`**：文本 / 图片模式切换；文本模式为大文本域，图片模式为拖拽上传区与预览（支持移除重传）。
- **译文面板 `TargetPanel.tsx`**：可编辑译文区、加载遮罩、导出 TXT。
- **顶栏 / 底栏 `App.tsx`**：翻译触发按钮、错误提示、API 状态指示、处理进度与编码显示。

---

## 技术栈

| 层 | 选型 |
|---|---|
| 前端框架 | React 19 + TypeScript 5.8 |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite` 插件） |
| 图标 | lucide-react |
| 动效 | motion |
| 服务端 | Express 4（本地）/ Vercel Serverless Functions（线上） |
| AI SDK | `@google/genai`（Gemini 原生 SDK）；DeepSeek / OpenAI 兼容端点走原生 `fetch` |
| 打包 | Vite（前端）+ esbuild（服务端 bundle） |
| 部署 | Vercel |

---

## 快速开始

### 前置要求

- Node.js **18+**
- 至少一个可用的模型 API Key（Gemini / DeepSeek / 任意 OpenAI 兼容端点）

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/kuroshio4396/Novel-Translator.git
cd Novel-Translator

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选，见下一节）
cp .env.example .env

# 4. 启动开发服务器
npm run dev
```

`npm run dev` 会用 `tsx` 拉起 `server.ts`，Express 同时挂载 Vite 中间件，前端与 API 在同一端口（默认 `3000`）提供服务。浏览器打开 <http://localhost:3000> 即可。

> API Key 也可以完全不写进环境变量：直接在界面左侧边栏对应厂商的输入框里填写，同样生效。

### 可用脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 以 `tsx` 启动 `server.ts`，前端 + API 一体开发 |
| `npm run build` | `vite build` 产出前端静态资源，再用 esbuild 将 `server.ts` 打成 `dist/server.cjs` |
| `npm start` | 运行构建产物 `node dist/server.cjs` |
| `npm run preview` | 预览 `vite build` 的前端产物 |
| `npm run lint` | `tsc --noEmit` 全量类型检查 |
| `npm run clean` | 清理 `dist` 与 `server.js` |

---

## 环境变量

项目只需一个服务端环境变量：

| 变量 | 必填 | 说明 |
|---|---|---|
| `GEMINI_API_KEY` | 否 | Gemini 的默认 API Key。若前端已填写 Key，则前端的 Key 优先；此变量仅作为兜底默认值 |

`.env` 示例：

```dotenv
GEMINI_API_KEY="your_gemini_api_key"
```

> DeepSeek / OpenAI 兼容端点不使用环境变量，Key 一律由界面侧边栏传入。

---

## 部署到 Vercel

仓库已内置 `vercel.json`，无需额外配置：

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- 所有 `/api/*` 请求被重写到 Serverless Function `api/index.ts`；
- 其余路径回落到 `index.html`，由 React 单页应用接管路由。

**部署步骤：**

1. 在 Vercel 导入本仓库；
2. Framework Preset 选 **Vite**，Build Command 与 Output Directory 保持默认；
3. 如需服务端兜底 Key，在 **Environment Variables** 中添加 `GEMINI_API_KEY`；
4. Deploy。

当前线上实例：<https://novel-translator-lemon.vercel.app>

---

## API 说明

后端提供两个 POST 接口，本地 `server.ts` 与线上 `api/index.ts` 的行为一致。

### `POST /api/translate`

执行一次翻译。文本与图片共用同一入口，由请求体区分。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `provider` | `"gemini" \| "deepseek" \| "openai"` | 是 | 模型厂商 |
| `apiKey` | `string` | 否 | 该厂商的 API Key；留空则回退到 `process.env.GEMINI_API_KEY` |
| `model` | `string` | 否 | 模型名。默认：Gemini `gemini-2.5-pro`、DeepSeek `deepseek-chat`、OpenAI `gpt-3.5-turbo` |
| `baseUrl` | `string` | 否 | 仅 `openai` 厂商使用，自定义端点，默认 `https://api.openai.com/v1` |
| `text` | `string` | 文本模式必填 | 待翻译原文 |
| `imageBase64` | `string` | 图片模式必填 | 图片的 base64 数据（不含 `data:` 前缀） |
| `imageMimeType` | `string` | 图片模式必填 | 图片 MIME 类型，如 `image/jpeg` |
| `targetLang` | `string` | 否 | 目标语言，默认 `简体中文` |
| `style` | `string` | 否 | 风格描述，默认 `专业、流畅` |
| `terminology` | `string` | 否 | 术语表 / 禁忌词，逐条进入提示词 |

**响应**

```json
{ "translatedText": "……译文内容……" }
```

**请求示例（文本）**

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "apiKey": "YOUR_API_KEY",
    "text": "It was the best of times, it was the worst of times.",
    "targetLang": "简体中文",
    "style": "专业、流畅，保留小说原有氛围与断句习惯",
    "terminology": "King'\''s Landing -> 君临城"
  }'
```

**行为细节**

- 服务端把 `targetLang`、`style`、`terminology` 拼装成 system instruction，并要求「保留段落与换行格式、不输出任何额外对话性文字」；
- 采样温度固定 `0.3`，偏向稳定、可复现的译文；
- 图片模式仅在 Gemini 下可用。若对 DeepSeek / OpenAI 兼容端点传 `imageBase64`，接口返回 `400`，提示切换模型或改用纯文本；
- 图片模式下，提示词会要求模型先从图中提取文字并整理为正确的章节结构，再输出译文；
- 请求体上限放宽到 `50mb`，以容纳大图与超长文本。

**错误处理**

服务端会尝试从嵌套的 JSON 错误信息中抽取可读消息，并对两类高频错误做本地化改写：

| 原始错误 | 返回给用户的信息 |
|---|---|
| 含 `429` 或 `Quota exceeded` | 请求过于频繁或免费额度已耗尽 (Quota Exceeded)。请检查 API Key 额度或稍后再试。 |
| 含 `API key not valid` | API 密钥无效 (Invalid API Key)。请在侧边栏中配置有效的 API Key。 |

其余异常统一以 `500` 返回，并在 `error` 字段中给出原始或抽取后的消息。缺少 Key 时返回 `400`「未提供或未配置 API Key」。

### `POST /api/test-connection`

用一次极小的真实请求验证配置是否可用，供侧边栏「测试连接」按钮调用。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `provider` | `string` | 是 | 模型厂商 |
| `apiKey` | `string` | 否 | 同 `/api/translate`，可回退到环境变量 |
| `baseUrl` | `string` | 否 | 仅 `openai` 厂商使用 |
| `model` | `string` | 否 | 默认 `gemini-2.5-flash` / `deepseek-chat` / `gpt-3.5-turbo` |

**响应**

```json
{ "success": true }
```

OpenAI 兼容端点使用 `max_tokens: 5` 的测试请求，力求最小额度消耗。失败时同样返回 `500` 与本地化后的 `error` 消息。

---

## 项目结构

```
Novel-Translator/
├── api/
│   └── index.ts            # Vercel Serverless 入口（与 server.ts 逻辑一致）
├── assets/
│   └── .aistudio/          # AI Studio 相关配置
├── server/
│   └── api.ts              # 服务端 API 逻辑
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx     # 模型 / 密钥 / 风格 / 术语表配置面板
│   │   ├── SourcePanel.tsx # 原文输入与图片上传面板
│   │   └── TargetPanel.tsx # 译文展示、编辑与导出面板
│   ├── App.tsx             # 主界面布局、状态管理与翻译调度
│   ├── types.ts            # Provider / AppSettings / InputMode 类型定义
│   ├── main.tsx            # React 应用入口
│   └── index.css           # 全局样式与 Tailwind 引入
├── index.html              # HTML 模板
├── server.ts               # 本地开发服务器（Express + Vite 中间件）
├── list-models.ts          # 辅助脚本：列出账号下可用的 Gemini 3 系列模型
├── test-model*.ts          # 辅助脚本：逐一验证模型可用性
├── metadata.json           # 应用元信息
├── vercel.json             # Vercel 路由重写配置
├── vite.config.ts          # Vite 配置（React + Tailwind 插件、@ 别名）
├── tsconfig.json           # TypeScript 配置
└── package.json
```

> `list-models.ts` 与 `test-model*.ts` 是探索可用模型时留下的独立脚本，需要本地配置 `GEMINI_API_KEY` 后单独用 `npx tsx <文件名>` 运行，不参与应用运行时。

---

## 使用技巧

**1. 用术语表保住译名一致性**

跨章节翻译时，把已确定的人名、地名、组织名、招式名按 `原文 -> 译名` 逐行写进左侧「术语表 / 禁忌词」。术语表会逐条拼进系统指令，等于给模型一本随身的对照词典——这是长篇连载翻译里收益最大的一步。

```
Kael'thas -> 凯尔萨斯
Silvermoon -> 银月城
Light's Hope Chapel -> 光明希望教堂
```

**2. 用风格预设而非改提示词模板**

「翻译风格预设」是一段自由文本，直接描述你想要的文风即可，例如：

- `专业、流畅，保留小说原有氛围与断句习惯`（默认）
- `贴近网文语感，对话口语化，叙述简洁有力`
- `文风庄重典雅，保留原文的长句结构与修辞`

**3. 图片模式适合这两类场景**

- 拿到的是**扫描版 / 截图版**章节，手上没有可复制的文字；
- 原文含有大量**特殊排版或注音**，手工复制会丢失结构。

模型会先识别、再整理章节结构、最后翻译，一步到位。注意该能力目前仅 Gemini 支持。

**4. 接自建中转或本地模型**

厂商选「OpenAI 兼容 / 自定义」，`Base URL` 填你的端点（如 `http://localhost:11434/v1`），模型名手填。这样任何暴露 OpenAI 兼容接口的服务都能接进来。

**5. 译文区就是编辑器**

右侧译文是可直接编辑的文本域。译法不满意就地改，「导出 TXT」拿到的就是你最终校对的版本，不必再开别的编辑器。

**6. 刷新不丢稿**

原文、译文、设置都存在 `localStorage`，长文翻译中途刷新浏览器，进度仍在。注意图片同样会尝试写入 `localStorage`，超大图可能触及容量上限（此时仅图片不被保存，控制台会给出提示）。

---

## 常见问题

<details>
<summary><b>提示「未提供或未配置 API Key」</b></summary>

当前厂商的 Key 既没有在侧边栏填写，服务端也没有提供 `GEMINI_API_KEY` 兜底。请在左侧「API 密钥管理 → 当前厂商 API Key」填入该厂商的 Key。

</details>

<details>
<summary><b>提示「请求过于频繁或免费额度已耗尽 (Quota Exceeded)」</b></summary>

模型的配额已用尽或触发了限流。可换用额度更充裕的模型 / API Key，或稍后重试。

</details>

<details>
<summary><b>提示「API 密钥无效 (Invalid API Key)」</b></summary>

Key 拼写有误、已失效，或与所选厂商不匹配。请核对 Key 与厂商是否对应。

</details>

<details>
<summary><b>图片模式报错「当前仅 Gemini 模型支持图片识别功能」</b></summary>

这是预期行为。图片识别依赖视觉能力，请在侧边栏把厂商切回 Google Gemini，或改用文本模式粘贴原文。

</details>

<details>
<summary><b>本地启动后接口 404 / 前端页面打不开</b></summary>

确认使用的是 `npm run dev`（用 `tsx` 拉起 `server.ts`，前端与 API 同端口），而不是直接开 Vite。默认端口 `3000`，若被占用请释放端口后重试。

</details>

<details>
<summary><b>大图上传失败或刷新后图片丢失</b></summary>

浏览器 `localStorage` 有容量上限（通常约 5MB）。应用已对写入失败做容错——翻译本身不受影响，只是图片不会被持久化。建议压缩图片，或一次性完成该图的翻译。

</details>

<details>
<summary><b>OpenAI 兼容端点连不上</b></summary>

在侧边栏点「测试连接」查看具体报错。注意 `Base URL` 只需填到版本段（如 `https://api.openai.com/v1`），服务端会自动补 `/chat/completions`；若你直接填了完整的 `/chat/completions` 地址，服务端也能正确识别、不会重复拼接。

</details>

---

## 安全说明

- **API Key 的存放位置**：用户在界面中填写的 Key 保存在本机浏览器的 `localStorage`，随每次翻译请求发送到该应用自己的后端，由后端转发给对应的模型厂商。请勿将本项目部署到不受信任的环境。
- **服务端兜底 Key**：若通过 `GEMINI_API_KEY` 环境变量配置，请使用 Vercel 的环境变量功能，不要提交 `.env` 到仓库（`.gitignore` 已排除）。
- **请求体上限**：为支持大图，服务端接受最大 `50mb` 的 JSON 请求体，部署时请注意平台的请求体限制。
- **无用户体系**：项目不包含账号、鉴权与配额管理。若对外公开部署，请自行在网关层加上访问控制与限流。

---

## 许可证

本仓库目前尚未附带 `LICENSE` 文件，因此默认适用「保留所有权利」（all rights reserved）——代码可阅读、可参考，但未经许可不得再分发或用于二次开发。

如需开源授权，建议在仓库根目录补充一份 `LICENSE`（例如 MIT），并在本节注明。GitHub 也提供了可视化添加方式：仓库首页 → `Add file` → `Create new file` → 文件名填 `LICENSE` → 右侧出现 `Choose a license template` 按钮 → 选择模板并提交。

---

## 致谢

- 界面视觉与交互参照 Microsoft Fluent / Office 设计语言
- 感谢 Google Gemini、DeepSeek 提供的模型能力
- 项目原型在 Google AI Studio 中搭建，后迁移至 Vite + Express + Vercel 的自托管形态
