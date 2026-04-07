---
title: Face Shape Detector — PRD
version: 1.0
created: 2026-04-05
status: draft
---

# Face Shape Detector — 产品需求文档

## 一、产品定位

**一句话定位**：上传照片，AI 检测你的脸型，给你最适合的发型、眼镜和妆容建议。

**核心差异化**：竞品只做「检测」，我们做「检测 + 深度建议」—— 用户不只是想知道自己是什么脸型，而是想知道**该怎么选发型、怎么选眼镜**。

---

## 二、目标用户（ICP）

| 维度 | 描述 |
|------|------|
| 核心人群 | 18-35 岁女性，关注美容/时尚 |
| 次要人群 | 男性（选发型、选眼镜框）|
| 地域 | 美国为主，英语国家 |
| 搜索场景 | "what is my face shape"、"face shape test"、"hairstyle for my face shape" |
| 用户任务 | 我想知道自己的脸型，然后知道什么发型/眼镜/妆容最适合我 |

---

## 三、竞品分析摘要

> 数据来源：Ahrefs SERP Overview + Backlink Checker（2026-04-07）

| 竞品 | DR | 有机流量 | 建站时间 | 核心弱点 |
|------|:---:|---------|----------|----------|
| faceshapedetector.ai (#1) | 49 | 31K/月 | 2025-01 | face swap 改壳、SEO 堆砌、建议浅 |
| byrdie.com (#2) | 85 | 26K/月 | 老牌媒体 | 内页排名，不是工具页，无交互功能 |

**关键竞争指标**：

| 指标 | 数据 | 说明 |
|------|------|------|
| KD（关键词难度）| **28**（中等） | Ahrefs 实测 |
| KGR（黄金比率）| **0.38** | allintitle 167K / 月搜索量 444K，中等竞争 |
| 进前 10 门槛 | **~33 个引用域名** | 外链建设完全可行 |
| #1 站 DR | 49（1 年 3 月新站）| 新站可以快速拿 #1 |

**SERP 现状（2026-04-07）**：前 6 名中 3 个是凑数（Facebook 社交帖、YouTube Shorts、Reddit 帖子），SERP 严重不饱和，Google 缺优质工具页。byrdie.com DR 85 但只排 #2，说明 Google 对这个词重视工具匹配度远超域名权重。

> 完整调研数据见 `keyword-report.md`

---

## 四、差异化策略

### 竞品已经做到的（必须平齐）

faceshapedetector.ai 的实际产品力比页面文案看起来更强：
- 一次上传做五维分析（脸型 + 眼型 + 鼻型 + 唇形 + 眉形）
- 首页内嵌脸型-发型对照表（按性别分）
- 10 篇精准选词的博客文章承接长尾流量
- 5 种语言版本扩大覆盖面

### 我们的差异化（在平齐基础上超越）

| 维度 | 竞品现状 | 我们怎么做 |
|------|---------|-----------|
| 结果呈现 | 文字结论，无可视化 | **在照片上叠加关键点 + 测量线 + 比例标注**，让用户「看到」检测过程 |
| 推荐深度 | 表格式罗列发型名 | **每个推荐带参考图片 + 为什么适合你的解释** |
| 结果预览 | 用户上传前不知道会得到什么 | **首页交互 demo**：示例照片自动播放检测过程 |
| 脸型精度 | 只有 6 种硬分类 | **混合脸型判断**：如"偏椭圆的心形"，置信度百分比 |
| 长尾覆盖 | 10 篇博客 | **7 个脸型指南页（程序化）+ 博客文章**，覆盖面更广 |
| 信任感 | "face swap 改壳"，About 页暴露 | **品牌统一**，专注脸型分析，隐私可验证（浏览器端处理） |
| 互动性 | 检测完就结束 | **明星脸型对比**（P1）：你和哪个明星最像 |

---

## 五、MVP 功能清单

### P0 — 必须上线（第一版）

#### 5.1 核心工具：脸型检测

**上传模块**
- 支持拖拽、点击上传、粘贴图片
- 支持格式：JPG、PNG、WebP
- 文件大小限制：5MB
- 移动端支持摄像头直接拍照
- 上传前预览，支持裁剪/旋转

**检测模块（五维分析，平齐竞品）**
- MediaPipe Face Mesh 检测 468 个面部关键点
- 浏览器端运行（TensorFlow.js），无需上传到服务器
- **维度一：脸型分类**
  - 计算关键比例：额头宽度、颧骨宽度、下颌宽度、面部长度、下颌角度
  - 分类为 7 种脸型：Oval、Round、Square、Heart、Oblong、Diamond、Triangle
  - 支持混合脸型结果（主脸型 + 次脸型倾向 + 置信度百分比）
- **维度二：眼型检测** — 眼睛形状、大小、间距
- **维度三：鼻型分析** — 宽/窄/中间型
- **维度四：唇形分析** — 唇形分类
- **维度五：眉形分析** — 基于脸部结构推荐适合的眉形

> 五维分析是竞品已有的功能，必须平齐。我们的差异化在结果呈现（可视化）和推荐深度（带图 + 解释）。

**结果页**（核心差异化页面）
- 脸型判定 + 置信度百分比
- **检测可视化**：在照片上叠加关键点、测量线、比例标注
- **发型推荐**：3-5 款最适合的发型，每款带参考图片 + 说明
- **眼镜推荐**：3-5 款最适合的镜框类型，带参考图片
- **妆容建议**：修容重点、眉形建议（文字 + 示意图）
- 结果可分享（生成结果图片 / 分享链接）
- CTA：引导用户尝试其他功能或查看脸型详细指南

#### 5.2 脸型指南页（SEO 长尾页 × 7）

每种脸型一个独立页面，用于长尾 SEO：
- `/face-shape/oval`
- `/face-shape/round`
- `/face-shape/square`
- `/face-shape/heart`
- `/face-shape/oblong`
- `/face-shape/diamond`
- `/face-shape/triangle`

每页内容结构：
- 脸型特征描述（带示意图）
- 哪些明星是这种脸型（增加趣味性和搜索量）
- 最佳发型推荐（女性 5 款 + 男性 5 款，带图片）
- 最佳眼镜框推荐（5 款，带图片）
- 妆容/修容技巧
- 应避免的发型/眼镜
- FAQ

#### 5.3 首页

**Hero 区**
- 标题：Find Your Face Shape in Seconds
- 副标题：Get personalized hairstyle, glasses & makeup recommendations
- 上传区域（突出展示）
- **交互 demo**：自动播放的示例检测过程（示例照片 → 关键点标注 → 脸型结果 → 推荐卡片）

**信任区**
- 已检测 X 次（计数器）
- 隐私承诺：照片不上传到服务器，浏览器端处理
- 检测速度：< 3 秒

**脸型概览区**
- 7 种脸型卡片（点击进入对应指南页）

**How It Works**
- 3 步流程：上传 → AI 分析 → 获取建议

**FAQ**
- 8-10 个常见问题，带 Schema markup（FAQPage）

#### 5.4 SEO 基建

- Meta title/description 优化（每页独立）
- Open Graph + Twitter Card（分享时展示结果预览）
- JSON-LD Schema：SoftwareApplication + FAQPage + HowTo
- Sitemap.xml（自动生成，含 lastmod）
- Robots.txt
- Canonical 标签（每页自引用，避免星城踩的坑）
- Core Web Vitals 达标：LCP < 2.5s, CLS < 0.1, INP < 200ms
- 301 统一首选域（www 或非 www 选一个）

### P1 — 第二版迭代

- 明星脸型对比（你和哪个明星脸型最像）
- Blog 模块：精准选词的长尾文章，参考竞品策略：
  - `face shape haircut` — 核心转化文
  - `celebrity face shapes` — 名人效应引流
  - `eyeglasses for face shape` — 购物意图
  - `face shape personality` — 娱乐引流
  - `oval vs round face` — 对比型
  - `hat for face shape` — 购物意图
- 多语言支持（西班牙语、葡萄牙语优先，低成本流量乘数）
- 历史检测记录（本地存储）

### P2 — 远期

- 用户账号系统
- AI 虚拟试发型（上传照片 → 换发型预览）
- AI 虚拟试眼镜
- 付费功能：高级分析报告 / 无水印导出
- 联盟营销：推荐眼镜/美妆产品，带 affiliate 链接

---

## 六、页面架构

```
/                           ← 首页（核心工具 + SEO 主页面）
/result?id=xxx              ← 检测结果页（动态生成）
/face-shape/oval            ← 椭圆脸指南
/face-shape/round           ← 圆脸指南
/face-shape/square          ← 方脸指南
/face-shape/heart           ← 心形脸指南
/face-shape/oblong          ← 长形脸指南
/face-shape/diamond         ← 菱形脸指南
/face-shape/triangle        ← 三角脸指南
/about                      ← 关于页
/privacy                    ← 隐私政策
/terms                      ← 使用条款
```

MVP 总共 **11 个页面**。

---

## 七、技术架构

### 前端

| 选型 | 说明 |
|------|------|
| Next.js 14+ (App Router) | SSR/SSG 支持，SEO 友好 |
| TypeScript | 类型安全 |
| TailwindCSS | 快速 UI 开发 |
| MediaPipe Face Mesh | 468 个面部关键点检测，浏览器端运行 |
| TensorFlow.js | 脸型分类模型推理 |
| Canvas API | 在照片上绘制关键点和测量线 |

### 后端

MVP 阶段**不需要后端服务器**：
- 脸型检测在浏览器端完成（MediaPipe + TF.js）
- 推荐数据是静态 JSON（每种脸型对应的推荐列表）
- 计数器可用 Cloudflare Analytics 或简单的 KV

### 部署

| 组件 | 方案 |
|------|------|
| 部署 | Vercel |
| CDN/防护 | Cloudflare（**第一天就套上**） |
| 域名 | Cloudflare Registrar 或 Namecheap |
| 分析 | Google Analytics 4 + Google Search Console |
| 监控 | Vercel Analytics（Core Web Vitals） |

### 隐私设计

- 照片**不上传到任何服务器**，全部在浏览器端处理
- 检测完成后浏览器内存自动释放
- 这是真实的隐私优势，竞品声称但未证明

---

## 八、SEO 关键词矩阵

### 主词（首页目标）

```
face shape
face shape detector
face shape test
what is my face shape
face shape analyzer
```

### 长尾词（指南页目标）

| 页面 | 目标关键词 |
|------|-----------|
| /face-shape/oval | oval face shape, hairstyles for oval face, glasses for oval face |
| /face-shape/round | round face shape, hairstyles for round face, glasses for round face |
| /face-shape/square | square face shape, hairstyles for square face |
| /face-shape/heart | heart shaped face, hairstyles for heart shaped face |
| /face-shape/oblong | oblong face shape, long face hairstyles |
| /face-shape/diamond | diamond face shape, diamond face hairstyles |
| /face-shape/triangle | triangle face shape, hairstyles for triangle face |

### 内链策略

- 首页 → 各脸型指南页（脸型概览区卡片）
- 结果页 → 对应脸型指南页（"了解更多关于你的脸型"）
- 各指南页 → 首页工具（"立即检测你的脸型"）
- 各指南页 → 相关脸型页（"你可能也想了解"）

---

## 九、MVP 开发计划

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| Day 1 | 技术验证：MediaPipe Face Mesh demo，确认浏览器端检测可行 | 0.5 天 |
| Day 1 | 买域名 + Vercel 项目初始化 + 套 Cloudflare | 0.5 天 |
| Day 2-3 | 脸型检测：上传 → 关键点提取 → 比例计算 → 7 类脸型分类 → Canvas 可视化 | 2 天 |
| Day 4-5 | 四维扩展：眼型 + 鼻型 + 唇形 + 眉形检测与分类逻辑 | 2 天 |
| Day 6 | 结果页开发：五维结果展示 + 推荐内容（发型/眼镜数据 + UI） | 1 天 |
| Day 7 | 首页开发：Hero + 交互 demo + 脸型概览 + FAQ | 1 天 |
| Day 8-9 | 7 个脸型指南页（模板化生成，内容用 AI 辅助） | 1.5 天 |
| Day 9-10 | SEO 基建：meta/schema/sitemap/canonical/OG + 性能优化 | 1 天 |
| Day 10-11 | 测试 + 修 bug + 移动端适配 + 上线 | 1.5 天 |

**MVP 目标：11 天上线。**

> 核心风险在 Day 4-5 的四维扩展。如果某个维度的分类逻辑调不准，先用简化版上线（比如眉形只给 3 种分类而不是 5 种），后续迭代精调。不要因为某个维度卡住而延迟整体上线。

---

## 十、上线后 Checklist

- [ ] Google Search Console 注册 + 提交 sitemap
- [ ] Google Analytics 4 接入
- [ ] Cloudflare CDN 缓存配置
- [ ] Core Web Vitals 测试通过（PageSpeed Insights）
- [ ] 移动端体验测试
- [ ] OG 图片 / Twitter Card 测试（分享预览）
- [ ] 开始外链建设（参考星城策略：每天 10-20 个，follow 竞品外链来源）
- [ ] 提交 AI 导航站（TAAFT 等，参考 SEO 小册子目录策略）

---

## 十一、成功指标

| 指标 | 1 个月目标 | 3 个月目标 |
|------|-----------|-----------|
| Google 收录页面数 | 11 页全部收录 | 11+ blog 页 |
| 核心词排名 | 进入前 50 | 进入前 10 |
| 日访问量 | 100+ | 1000+ |
| 长尾词覆盖 | 50+ 个关键词有展现 | 200+ |
