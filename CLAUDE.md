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

## 技术栈

- Next.js 14+ (App Router) + TypeScript + TailwindCSS
- @tensorflow-models/face-landmarks-detection（MediaPipe 后端）
- TensorFlow.js（浏览器端推理）
- Canvas API（可视化）
- Vercel 部署 + Cloudflare CDN
- pnpm

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

## 开发计划（11 天）

| 阶段 | 任务 |
|------|------|
| Day 1 | 环境搭建 + 买域名 + 跑通 framefinder |
| Day 2-3 | 脸型检测核心（上传→检测→分类→Canvas 可视化） |
| Day 4-5 | 四维扩展（眼/鼻/唇/眉） |
| Day 6 | 结果页（五维结果 + 推荐内容） |
| Day 7 | 首页（Hero + demo + FAQ） |
| Day 8-9 | 7 个脸型指南页 + SEO 基建 |
| Day 10-11 | 测试 + 上线 |

## 关键决策

- 照片不上传服务器，全部浏览器端处理（真隐私）
- 第一天就套 Cloudflare（避免 Vercel 请求数爆炸）
- 301 统一首选域 + 每页自引用 canonical（避免排名掉坑）
- 某维度分类调不准就先简化上线，不卡整体进度

## SEO 目标

- 主词：face shape / face shape detector / what is my face shape
- 长尾：7 个脸型指南页覆盖 hairstyles for [type] face / glasses for [type] face
- 1 个月目标：11 页全部收录，核心词进前 50
- 3 个月目标：核心词进前 10，日访问 1000+

## 关键词研究来源

- 本项目报告：`keyword-report.md`（六步法验证 + KGR + Ahrefs 数据）
- 方法论文档：`/home/memory-work/01 项目/出海 web/关键词验证六步法.md`
- 实操手册：`/home/memory-work/01 项目/出海 web/关键词验证六步法-实操手册.md`
