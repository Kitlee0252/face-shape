---
title: Face Shape Detector — Technical Spec
version: 1.0
created: 2026-04-05
status: draft
---

# Face Shape Detector — 技术实现方案

## 一、技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 框架 | Next.js 14+ (App Router) | SSR/SSG，SEO 友好 |
| 语言 | TypeScript | 类型安全 |
| 样式 | TailwindCSS | 快速开发 |
| AI 检测 | @tensorflow-models/face-landmarks-detection | 官方库，478 个 3D 面部关键点 |
| 推理引擎 | TensorFlow.js + MediaPipe 后端 | 浏览器端运行，零服务器成本 |
| 可视化 | Canvas API | 在照片上绘制关键点和测量线 |
| 部署 | Vercel | 自动 CI/CD |
| CDN | Cloudflare | 第一天就套上，防 Vercel 请求爆炸 |
| 分析 | GA4 + Google Search Console | 流量和 SEO 监控 |
| 包管理 | pnpm | 全局规范 |

---

## 二、项目结构

```
face-shape/
├── app/
│   ├── layout.tsx                 # 全局 layout（SEO meta、字体、GA4）
│   ├── page.tsx                   # 首页（工具入口）
│   ├── result/
│   │   └── page.tsx               # 结果页（五维分析 + 推荐）
│   ├── face-shape/
│   │   ├── [type]/
│   │   │   └── page.tsx           # 脸型指南页（7 种，SSG 生成）
│   │   └── types.ts               # 脸型数据定义
│   ├── about/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── sitemap.ts                 # 动态 sitemap
│   └── robots.ts                  # robots.txt
├── components/
│   ├── upload/
│   │   ├── UploadZone.tsx         # 拖拽/点击/拍照上传
│   │   └── ImagePreview.tsx       # 上传预览 + 裁剪
│   ├── detector/
│   │   ├── FaceDetector.tsx       # 检测主组件（协调五维分析）
│   │   ├── FaceMeshLoader.tsx     # TF.js 模型加载（懒加载 + 进度条）
│   │   └── CanvasOverlay.tsx      # Canvas 可视化（关键点 + 测量线）
│   ├── result/
│   │   ├── FaceShapeResult.tsx    # 脸型结果卡片
│   │   ├── EyeShapeResult.tsx     # 眼型结果卡片
│   │   ├── NoseResult.tsx         # 鼻型结果卡片
│   │   ├── LipResult.tsx          # 唇形结果卡片
│   │   ├── EyebrowResult.tsx      # 眉形结果卡片
│   │   └── RecommendationCard.tsx # 推荐卡片（发型/眼镜，带图）
│   ├── home/
│   │   ├── HeroSection.tsx        # 首页 Hero + 上传区
│   │   ├── DemoAnimation.tsx      # 交互 demo 自动播放
│   │   ├── FaceShapeGrid.tsx      # 7 种脸型概览卡片
│   │   ├── HowItWorks.tsx         # 三步流程
│   │   └── FAQ.tsx                # FAQ + Schema markup
│   └── shared/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── SEOHead.tsx            # JSON-LD Schema 生成
├── lib/
│   ├── detection/
│   │   ├── landmarks.ts           # TF.js 模型初始化 + 关键点提取
│   │   ├── faceShape.ts           # 脸型分类算法（规则系统）
│   │   ├── eyeShape.ts            # 眼型分类算法
│   │   ├── noseShape.ts           # 鼻型分类算法
│   │   ├── lipShape.ts            # 唇形分类算法
│   │   ├── eyebrowShape.ts        # 眉形分类算法
│   │   ├── geometry.ts            # 几何计算工具函数（距离、角度、比例）
│   │   └── types.ts               # 检测结果类型定义
│   └── data/
│       ├── faceShapes.ts          # 7 种脸型数据（描述、特征、明星）
│       ├── hairstyles.ts          # 发型推荐数据（按脸型 × 性别）
│       ├── glasses.ts             # 眼镜推荐数据（按脸型）
│       └── makeup.ts              # 妆容建议数据（按脸型）
├── public/
│   ├── images/
│   │   ├── hairstyles/            # 发型参考图
│   │   ├── glasses/               # 眼镜参考图
│   │   └── demo/                  # 首页 demo 用的示例图
│   └── models/                    # TF.js 模型文件（如需本地托管）
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── PRD.md
```

---

## 三、核心算法

### 3.1 关键点检测

```typescript
// lib/detection/landmarks.ts
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// 使用 MediaPipe FaceMesh 后端，输出 478 个 3D 关键点
// 每个关键点包含 x, y, z 坐标（归一化到 0-1）
// 关键点索引参考：https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/mesh_map.jpg
```

### 3.2 脸型分类（规则系统）

参考项目：[Mgeijer/framefinder](https://github.com/Mgeijer/framefinder)

**核心测量值**：

| 测量项 | 关键点 | 说明 |
|--------|--------|------|
| 额头宽度 | 点 71 ↔ 301 | 额头两侧最宽处 |
| 颧骨宽度 | 点 234 ↔ 454 | 颧骨两侧最宽处 |
| 下颌宽度 | 点 58 ↔ 288 | 下颌两侧 |
| 面部长度 | 点 10 ↔ 152 | 发际线到下巴 |
| 下颌角度 | 点 58, 152, 288 | 下颌线的角度 |

**分类规则**：

```
设：
  R1 = 面部长度 / 颧骨宽度    （脸部纵横比）
  R2 = 额头宽度 / 颧骨宽度    （额头相对宽度）
  R3 = 下颌宽度 / 颧骨宽度    （下颌相对宽度）
  JA = 下颌角度                （下颌线锐度）

分类逻辑：
  Oval:     R1 ≈ 1.3-1.5, R2 ≈ R3, JA 适中
  Round:    R1 ≈ 1.0-1.2, R2 ≈ R3, JA 大（圆润）
  Square:   R1 ≈ 1.0-1.3, R3 接近 1.0, JA 小（方正）
  Heart:    R2 > R3 明显, 下巴尖
  Oblong:   R1 > 1.5, R2 ≈ R3
  Diamond:  颧骨 > 额头 且 颧骨 > 下颌, 明显
  Triangle: R3 > R2 明显
```

> 具体阈值需要参考 framefinder 源码 + 实测调参。

### 3.3 眼型分类

参考项目：[zementalist/Facial-Features-Measurement-and-Analysis](https://github.com/zementalist/Facial-Features-Measurement-and-Analysis)

**关键点**：眼角内侧（133/362）、眼角外侧（33/263）、上眼睑中点（159/386）、下眼睑中点（145/374）

**分类维度**：
- 眼睛斜度：内眼角到外眼角的斜率 → 上挑 / 平直 / 下垂
- 眼睛大小：上下眼睑间距 / 眼睛宽度比 → 大 / 中 / 小
- 眼间距：两内眼角距离 / 眼睛宽度 → 窄 / 标准 / 宽

### 3.4 鼻型分类

**关键点**：鼻梁顶部（6）、鼻尖（1）、鼻翼两侧（129/358）

**分类维度**：
- 鼻宽：鼻翼间距 / 面部宽度比 → 窄 / 中 / 宽
- 鼻长：鼻梁顶部到鼻尖距离 / 面部长度比 → 短 / 中 / 长
- 鼻弓角度：鼻梁线与鼻尖的夹角

### 3.5 唇形分类

**关键点**：上唇中点（13）、下唇中点（14）、嘴角（61/291）、上唇边缘（0）、下唇边缘（17）

**分类维度**：
- 唇厚度：上下唇高度 → 薄唇 / 中等 / 丰唇
- 唇宽：嘴角间距 / 面部宽度比 → 窄 / 中 / 宽
- 上下唇比例：上唇高度 / 下唇高度

### 3.6 眉形分类

**关键点**：眉头（70/300）、眉峰（105/334）、眉尾（107/336）

**分类维度**：
- 眉形：眉头→眉峰→眉尾的角度变化 → 直眉 / 弧形 / 高挑
- 眉间距：两眉头间距 / 眼睛宽度
- 眉长：眉头到眉尾距离

---

## 四、数据流

```
用户选择/拍摄照片
  ↓
UploadZone 组件接收 File 对象
  ↓
创建 HTMLImageElement，绘制到隐藏 Canvas
  ↓
FaceMeshLoader 懒加载 TF.js 模型（首次约 2-3MB）
  ↓
模型推理 → 返回 478 个 3D 关键点坐标
  ↓
并行执行五维分类算法：
  ├── faceShape.ts → FaceShapeResult
  ├── eyeShape.ts → EyeShapeResult
  ├── noseShape.ts → NoseShapeResult
  ├── lipShape.ts → LipShapeResult
  └── eyebrowShape.ts → EyebrowShapeResult
  ↓
CanvasOverlay 在照片上绘制可视化
  ↓
将结果序列化为 URL 参数，跳转到 /result 页
  ↓
结果页读取参数，渲染五维结果 + 推荐内容
```

---

## 五、性能策略

| 问题 | 方案 |
|------|------|
| TF.js 模型文件大（2-3MB） | 懒加载：用户点击上传后才开始加载模型 |
| 模型加载慢 | 显示加载进度条 + 预热提示 |
| 首屏 LCP | 首页 SSG 静态生成，模型不影响首屏 |
| 图片处理 | 上传后先 resize 到 640px 宽，减少推理时间 |
| CLS | 上传区和结果区预留固定高度 |
| 移动端性能 | MediaPipe Lite 模型（更小更快，精度略降） |

---

## 六、SEO 实现

### 6.1 页面级 Meta

```typescript
// 每个页面独立定义 metadata
export const metadata: Metadata = {
  title: 'Face Shape Detector - Find Your Face Shape in Seconds',
  description: 'Upload your photo to detect your face shape instantly. Get personalized hairstyle, glasses, and makeup recommendations. Free, private, no signup required.',
  // ... openGraph, twitter
}
```

### 6.2 JSON-LD Schema

首页注入：
- `SoftwareApplication`（工具类应用）
- `FAQPage`（FAQ 区域）
- `HowTo`（使用步骤）

指南页注入：
- `Article`
- `BreadcrumbList`

### 6.3 Sitemap

```typescript
// app/sitemap.ts
// 静态页面：首页 + 7 个脸型指南 + about/privacy/terms = 11 页
// 动态更新 lastmod
```

### 6.4 内链结构

```
首页 ←→ 各脸型指南页（双向链接）
结果页 → 对应脸型指南页（"了解更多"）
各指南页 → 相关脸型页（"你可能也想了解"）
所有页面 → 首页工具（"立即检测"CTA）
```

---

## 七、隐私实现

```
关键原则：照片永远不离开浏览器

实现方式：
1. 用户选择照片 → FileReader 读取为 Data URL
2. 在 Canvas 上绘制 → 送入 TF.js 模型推理
3. 推理完成 → 提取关键点坐标（纯数字）
4. 释放 Canvas 和图片引用
5. 跳转结果页时只传坐标和分类结果，不传图片

可验证性：
- 浏览器 DevTools Network 面板可确认无图片上传请求
- 可在隐私页面说明这一点，教用户自行验证
```

---

## 八、开源参考索引

| 项目 | 用途 | 地址 |
|------|------|------|
| framefinder | 脸型分类算法（TypeScript，直接参考） | github.com/Mgeijer/framefinder |
| Facial-Features-Measurement | 眼/鼻/眉几何分类（Python → 翻译为 TS） | github.com/zementalist/Facial-Features-Measurement-and-Analysis |
| face-landmarks-detection | 官方 TF.js 关键点检测库 | github.com/tensorflow/tfjs-models |
| Face-Shape-Detection | MediaPipe + 随机森林分类（参考思路） | github.com/akashchoudhary436/Face-Shape-Detection |
| automated-glasses-recommendation | 脸型→眼镜推荐完整方案（参考产品设计） | github.com/sinfulExiled/automated-glasses-recomendation-system |

---

## 九、开发顺序

```
Day 1:  环境搭建
        ├── pnpm create next-app（Next.js + TS + Tailwind）
        ├── 买域名 + Vercel 项目 + 套 Cloudflare
        └── 跑通 framefinder 代码，理解脸型分类逻辑

Day 2-3: 核心检测
        ├── 接入 @tensorflow-models/face-landmarks-detection
        ├── 实现 faceShape.ts 分类算法（参考 framefinder）
        ├── 实现 CanvasOverlay 可视化
        └── 上传 → 检测 → 显示脸型结果 全流程跑通

Day 4-5: 四维扩展
        ├── 实现 eyeShape.ts（参考 zementalist）
        ├── 实现 noseShape.ts
        ├── 实现 lipShape.ts
        ├── 实现 eyebrowShape.ts
        └── geometry.ts 工具函数抽取复用

Day 6:  结果页
        ├── 五维结果卡片 UI
        ├── 推荐内容（发型/眼镜数据 + 图片 + RecommendationCard）
        └── 结果分享功能

Day 7:  首页
        ├── HeroSection + UploadZone
        ├── DemoAnimation（示例检测过程）
        ├── FaceShapeGrid（7 种脸型卡片）
        ├── HowItWorks + FAQ
        └── Header + Footer

Day 8-9: 指南页 + SEO
        ├── [type]/page.tsx 模板 + generateStaticParams
        ├── 7 种脸型的内容数据（AI 辅助生成）
        ├── JSON-LD Schema（SoftwareApplication + FAQPage + HowTo）
        ├── sitemap.ts + robots.ts
        ├── Meta + OG + canonical
        └── 301 重定向配置

Day 10-11: 测试 + 上线
        ├── 多设备测试（桌面 + 移动端）
        ├── PageSpeed Insights 优化（LCP < 2.5s）
        ├── 不同光线/角度照片测试检测准确性
        ├── GSC 注册 + 提交 sitemap
        └── 上线
```
