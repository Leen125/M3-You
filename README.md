# Material Design 3 UI 库

基于 Android 16 Material You 设计的完整UI组件库，无需构建步骤，直接引入即可使用。

## 快速开始

1. 下载所有文件到你的项目
2. 在HTML中引入核心文件：

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 核心CSS -->
    <link rel="stylesheet" href="css/m3-tokens.css">
    <link rel="stylesheet" href="css/m3-core.css">
    <link rel="stylesheet" href="css/m3-theme.css">
    
    <!-- 核心JS -->
    <script src="js/m3-hct-color.js"></script>
    <script src="js/m3-theme-engine.js"></script>
    <script src="js/m3-core.js"></script>
    <script src="js/m3-utils.js"></script>
    
    <!-- 组件（按需引入） -->
    <script src="js/m3-components/button.js"></script>
    <script src="js/m3-components/card.js"></script>
    <script src="js/m3-components/switch.js"></script>
</head>
<body>
    <!-- 使用组件 -->
    <m3-button>按钮</m3-button>
    <m3-card>卡片内容</m3-card>
    <m3-switch>开关</m3-switch>
</body>
</html>
```
## 文件结构

m3-you-ui/
├── css/
│   ├── m3-tokens.css      # 设计令牌系统
│   ├── m3-core.css        # 核心工具类
│   └── m3-theme.css       # 主题系统样式
├── js/
│   ├── m3-hct-color.js    # HCT色彩算法
│   ├── m3-theme-engine.js # 主题引擎
│   ├── m3-core.js         # 核心库
│   ├── m3-utils.js        # 工具函数
│   └── m3-components/     # 组件库
│       ├── button.js
│       ├── card.js
│       └── switch.js
├── index.html             #示例页面
└── README.md

## 主要特性

1.完整的Material Design 3规范 - 基于Android 16设计

2.动态色彩系统 - 支持壁纸取色、HCT色彩空间

3.暗色/亮色主题 - 自动适配系统偏好

4.无障碍设计 - 完整的ARIA支持和对比度检查

5.响应式设计 - 适配所有设备尺寸

6.零依赖 - 纯原生JavaScript实现

7.模块化 - 可按需加载组件

## 组件列表

✅ 按钮 (m3-button)

✅ 卡片 (m3-card)

✅ 开关 (m3-switch)

🔄 更多组件开发中...

## 主题控制
``` javascript
// 设置主题
window.M3Theme.generateSchemeFromSeed('#FF6B6B', false);

// 切换暗色模式
window.M3Theme.toggleTheme();

// 从图片提取主题
window.M3Theme.applyImageTheme('path/to/image.jpg');

// 获取当前主题
const theme = window.M3Theme.getThemeInfo();
```
## 浏览器支持

Chrome 61+

Firefox 63+

Safari 10.1+

Edge 79+