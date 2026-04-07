# Face Shape Detector

## 项目概述

AI 脸型检测工具站。上传照片，浏览器端 AI 检测脸型（五维分析），给出发型/眼镜/妆容推荐。

- **关键词**：face shape（月搜索量 ~44 万，KD=28，KGR=0.38）
- **差异化**：检测可视化 + 推荐带图带解释 + 混合脸型 + 浏览器端隐私
- **状态**：PRD + SPEC + 关键词报告已完成，待开发

## 项目文档

| 文档 | 说明 |
|------|------|
| keyword-report.md | 关键词验证报告：六步法验证 + KGR + Ahrefs 实测数据 |
| PRD.md | 产品需求：功能清单、差异化策略、页面架构、SEO 关键词矩阵 |
| SPEC.md | 技术方案：算法设计、项目结构、数据流、开发顺序 |

## 当前状态（2026-04-07）

- **已完成**：全站 11 页开发 + 部署 + 详细特征分析 + Google Analytics
- **域名**：faceshapeai.org（已配置 Cloudflare CDN + canonical）
- **测试**：90 个单元测试全部通过
- **已修复**：导航冻结 bug × 2（见下方问题记录）
- **已完成功能**：
  - 五维分析扩展：每个特征增加 Characteristics + Measurements + Ratings（对标竞品 faceshapedetector.ai）
  - 结果页 6 标签页 UI（Shape / Score / Eyes / Brows / Lips / Nose）
  - Feature Ratings 评分系统（基于黄金比例/五分法的子评分）
  - Google Analytics G-HV765XCJ25

## 开发流程

- **先本地验证再 push**：`pnpm run dev` + 公网隧道链接给用户验证，确认后再 push
- 每次 push 自动触发 Cloudflare Pages 部署（免费 500 次/月，当前用量 ~23 次）

## 已知问题 & 修复记录

### 导航冻结 bug（已修复 2026-04-07）
- **现象**：在各页面之间切换 ~5 次后，UI 卡死无法继续导航
- **根因**：
  1. `app/page.tsx` 在顶层 import FaceDetector，导致整个 `@mediapipe/tasks-vision` WASM bundle（~10MB+）被包含在首页 chunk，每次页面切换都要加载/卸载
  2. `FaceDetector` 用 `window.location.href = '/result'` 强制整页刷新，每次上传都重建 WebGL context，快速操作后 GPU context 耗尽
  3. Blob URL 未及时回收，sessionStorage 中存 blob URL 在整页刷新后失效
- **修复**：
  1. `app/page.tsx`：改为 `dynamic(() => import(...), { ssr: false })` 懒加载 FaceDetector，MediaPipe bundle 只在实际上传时才加载
  2. `FaceDetector.tsx`：`window.location.href` → `router.push('/result')`（客户端导航，保留 JS 上下文，避免重建 WebGL）
  3. `FaceDetector.tsx`：导航前将 blob URL 转为 data URL（JPEG 85%，限 800px），revoke blob URL，sessionStorage 存 data URL

### 导航哈希链接 bug（已修复 2026-04-07）
- **现象**：Face Shapes / How It Works / About 之间多切换几次会卡住
- **根因**：Header.tsx 导航链接用裸哈希（`#shapes`），非首页时导航到 `/about#shapes` 无效
- **修复**：`#shapes` → `/#shapes`、`#how` → `/#how`、`#try` → `/#try`

### 结果页 Tab crash（已修复 2026-04-07）
- **现象**：Eyes/Brows/Lips/Nose 标签页点击后页面崩溃
- **根因**：旧 sessionStorage 数据缺少新增字段（detailed、shape、symmetry 等）
- **修复**：AnalysisTabs 添加 `normalizeResult()` 为缺失字段填充默认值

## 下一步行动

1. **AI 图片生成**（最高优先级）：使用 Kie.ai (Flux Kontext) API 批量生成全站 114 张图片（方案已验证可行）
2. **GSC 提交**：Google Search Console 提交 sitemap，申请收录
3. **博客内容**：竞品有 10 篇博客覆盖长尾词，我们 0 篇 — 抢流量关键
4. **监测**：关注 Cloudflare Analytics 和 GSC 收录情况

## 图片生成方案（Kie.ai Flux Kontext API）

- **API**：`POST https://api.kie.ai/api/v1/flux/kontext/generate`（异步，轮询获取结果）
- **密钥**：`~/.secrets/kie.env`
- **已验证**：脸型线稿 + 发型摄影均质量合格，~12 秒/张

### 待生成清单

| 类别 | 数量 | 风格 | 比例 |
|------|------|------|------|
| 脸型轮廓图 | 7 | 统一线稿 | 1:1 |
| 女性发型 | 35 (7型×5) | 白底棚拍 | 3:4 |
| 男性发型 | 35 (7型×5) | 白底棚拍 | 3:4 |
| 眼镜款式 | 35 (7型×5) | 佩戴效果图 | 3:4 |
| Favicon + OG 图 | 2 | 品牌设计 | 1:1 / 16:9 |

### 风格规范

- 脸型轮廓：统一 prompt 模板，只改脸型关键词
- 发型/眼镜：统一白底棚拍风格，交替不同肤色/发色保证多样性
- 图片存放：`public/images/{shapes,hairstyles,glasses}/`

## 技术栈

- Next.js 16.2.2 (App Router, output: 'export') + TypeScript + TailwindCSS 4
- @mediapipe/tasks-vision 0.10.34（FaceLandmarker，浏览器端推理）
- Canvas API（检测可视化 + 图片预处理）
- Cloudflare Pages（静态托管 + GitHub 自动部署）
- pnpm

## 核心技术决策（已落地）

- **懒加载 MediaPipe**：`dynamic()` 确保 WASM bundle 不影响首屏加载和页面切换性能
- **客户端导航**：`router.push` 替代 `window.location.href`，保留 JS 上下文和 MediaPipe 单例
- **Data URL 存储**：检测结果图像转为 data URL 存 sessionStorage，避免 blob URL 生命周期问题
- **MediaPipe 单例**：`lib/detection/landmarks.ts` 模块级 `landmarker` 变量，客户端导航后可复用，无需重载模型

## 核心参考项目

| 项目 | 用途 |
|------|------|
| [Mgeijer/framefinder](https://github.com/Mgeijer/framefinder) | 脸型分类算法（Next.js + TS + MediaPipe，技术栈完全匹配） |
| [zementalist/Facial-Features-Measurement](https://github.com/zementalist/Facial-Features-Measurement-and-Analysis) | 眼/鼻/眉几何分类逻辑（Python → 翻译为 TS） |
| [tensorflow/tfjs-models/face-landmarks-detection](https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection) | 官方 TF.js 478 点人脸关键点检测 |

## 五维分析算法

全部使用规则系统（比例 + 角度），不需要训练模型：

1. **脸型**：额头/颧骨/下颌宽度比 + 脸部纵横比 + 下颌角度 → 7 类
2. **眼型**：眼角斜率 + 眼睛大小比 + 眼间距 → 上挑/平直/下垂 × 大/中/小
3. **鼻型**：鼻翼宽度比 + 鼻长比 + 鼻弓角度
4. **唇形**：唇厚度 + 唇宽比 + 上下唇比例
5. **眉形**：眉头→眉峰→眉尾角度变化 + 眉间距

## 关键决策

- 照片不上传服务器，全部浏览器端处理（真隐私）
- Cloudflare Pages + GitHub 自动部署（避免 Vercel 请求数爆炸）
- 301 统一首选域 + 每页自引用 canonical（避免排名掉坑）
- MediaPipe 单例 + 懒加载（性能优化，避免 WASM 重复加载）

## SEO 目标

- 主词：face shape / face shape detector / what is my face shape
- 长尾：7 个脸型指南页覆盖 hairstyles for [type] face / glasses for [type] face
- 1 个月目标：11 页全部收录，核心词进前 50
- 3 个月目标：核心词进前 10，日访问 1000+

## 关键词研究来源

- 本项目报告：`keyword-report.md`（六步法验证 + KGR + Ahrefs 数据）
- 方法论文档：`/home/memory-work/01 项目/出海 web/关键词验证六步法.md`
- 实操手册：`/home/memory-work/01 项目/出海 web/关键词验证六步法-实操手册.md`
