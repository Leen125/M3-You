/**
 * Material Design 3 - 核心组件库
 * 提供组件注册、工具函数和基础功能
 */
class M3Core {
  constructor() {
    this.components = new Map();
    this.listeners = new Map();
    this.stylesheets = new Set();
    
    // 自动注册全局样式
    this.registerGlobalStyles();
    
    // 监听主题变化
    this.setupThemeListener();
  }
  
  /**
   * 注册全局样式
   */
  registerGlobalStyles() {
    // 创建样式元素
    const style = document.createElement('style');
    style.id = 'm3-global-styles';
    
    // 基础全局样式
    style.textContent = `
      /* 基础重置 */
      .m3-reset {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font: inherit;
        color: inherit;
        background: transparent;
        border: none;
        outline: none;
      }
      
      /* 工具类 */
      .m3-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
      }
      
      .m3-flex { display: flex; }
      .m3-flex-column { flex-direction: column; }
      .m3-flex-row { flex-direction: row; }
      .m3-flex-center { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
      }
      .m3-flex-between { 
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
      }
      
      .m3-grid { display: grid; }
      .m3-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
      .m3-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .m3-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
      
      /* 间距系统 */
      .m3-gap-1 { gap: 4px; }
      .m3-gap-2 { gap: 8px; }
      .m3-gap-3 { gap: 12px; }
      .m3-gap-4 { gap: 16px; }
      .m3-gap-5 { gap: 20px; }
      .m3-gap-6 { gap: 24px; }
      .m3-gap-8 { gap: 32px; }
      .m3-gap-12 { gap: 48px; }
      
      .m3-p-1 { padding: 4px; }
      .m3-p-2 { padding: 8px; }
      .m3-p-3 { padding: 12px; }
      .m3-p-4 { padding: 16px; }
      .m3-p-6 { padding: 24px; }
      .m3-p-8 { padding: 32px; }
      
      .m3-m-1 { margin: 4px; }
      .m3-m-2 { margin: 8px; }
      .m3-m-3 { margin: 12px; }
      .m3-m-4 { margin: 16px; }
      .m3-m-6 { margin: 24px; }
      .m3-m-8 { margin: 32px; }
      
      /* 排版工具类 */
      .m3-text-display-large {
        font: var(--m3-typescale-display-large);
        letter-spacing: var(--m3-typescale-display-large-tracking);
      }
      .m3-text-display-medium {
        font: var(--m3-typescale-display-medium);
        letter-spacing: var(--m3-typescale-display-medium-tracking);
      }
      .m3-text-display-small {
        font: var(--m3-typescale-display-small);
        letter-spacing: var(--m3-typescale-display-small-tracking);
      }
      
      .m3-text-headline-large {
        font: var(--m3-typescale-headline-large);
      }
      .m3-text-headline-medium {
        font: var(--m3-typescale-headline-medium);
      }
      .m3-text-headline-small {
        font: var(--m3-typescale-headline-small);
      }
      
      .m3-text-title-large {
        font: var(--m3-typescale-title-large);
      }
      .m3-text-title-medium {
        font: var(--m3-typescale-title-medium);
        letter-spacing: var(--m3-typescale-title-medium-tracking);
      }
      .m3-text-title-small {
        font: var(--m3-typescale-title-small);
        letter-spacing: var(--m3-typescale-title-small-tracking);
      }
      
      .m3-text-body-large {
        font: var(--m3-typescale-body-large);
        letter-spacing: var(--m3-typescale-body-large-tracking);
      }
      .m3-text-body-medium {
        font: var(--m3-typescale-body-medium);
        letter-spacing: var(--m3-typescale-body-medium-tracking);
      }
      .m3-text-body-small {
        font: var(--m3-typescale-body-small);
        letter-spacing: var(--m3-typescale-body-small-tracking);
      }
      
      .m3-text-label-large {
        font: var(--m3-typescale-label-large);
        letter-spacing: var(--m3-typescale-label-large-tracking);
      }
      .m3-text-label-medium {
        font: var(--m3-typescale-label-medium);
        letter-spacing: var(--m3-typescale-label-medium-tracking);
      }
      .m3-text-label-small {
        font: var(--m3-typescale-label-small);
        letter-spacing: var(--m3-typescale-label-small-tracking);
      }
      
      /* 颜色工具类 */
      .m3-color-primary { color: var(--m3-sys-primary); }
      .m3-color-on-primary { color: var(--m3-sys-on-primary); }
      .m3-color-primary-container { color: var(--m3-sys-primary-container); }
      .m3-color-on-primary-container { color: var(--m3-sys-on-primary-container); }
      
      .m3-color-surface { color: var(--m3-sys-surface); }
      .m3-color-on-surface { color: var(--m3-sys-on-surface); }
      .m3-color-surface-variant { color: var(--m3-sys-surface-variant); }
      .m3-color-on-surface-variant { color: var(--m3-sys-on-surface-variant); }
      
      .m3-color-error { color: var(--m3-sys-error); }
      .m3-color-on-error { color: var(--m3-sys-on-error); }
      
      /* 背景工具类 */
      .m3-bg-primary { background-color: var(--m3-sys-primary); }
      .m3-bg-on-primary { background-color: var(--m3-sys-on-primary); }
      .m3-bg-primary-container { background-color: var(--m3-sys-primary-container); }
      .m3-bg-on-primary-container { background-color: var(--m3-sys-on-primary-container); }
      
      .m3-bg-surface { background-color: var(--m3-sys-surface); }
      .m3-bg-on-surface { background-color: var(--m3-sys-on-surface); }
      .m3-bg-surface-variant { background-color: var(--m3-sys-surface-variant); }
      .m3-bg-on-surface-variant { background-color: var(--m3-sys-on-surface-variant); }
      
      .m3-bg-error { background-color: var(--m3-sys-error); }
      .m3-bg-on-error { background-color: var(--m3-sys-on-error); }
      
      /* 高度工具类 */
      .m3-elevation-0 { box-shadow: var(--m3-elevation-0); }
      .m3-elevation-1 { box-shadow: var(--m3-elevation-1); }
      .m3-elevation-2 { box-shadow: var(--m3-elevation-2); }
      .m3-elevation-3 { box-shadow: var(--m3-elevation-3); }
      .m3-elevation-4 { box-shadow: var(--m3-elevation-4); }
      .m3-elevation-5 { box-shadow: var(--m3-elevation-5); }
      
      /* 形状工具类 */
      .m3-shape-extra-small { border-radius: var(--m3-shape-corner-extra-small); }
      .m3-shape-small { border-radius: var(--m3-shape-corner-small); }
      .m3-shape-medium { border-radius: var(--m3-shape-corner-medium); }
      .m3-shape-large { border-radius: var(--m3-shape-corner-large); }
      .m3-shape-extra-large { border-radius: var(--m3-shape-corner-extra-large); }
      .m3-shape-full { border-radius: var(--m3-shape-corner-full); }
      
      /* 状态层混合 */
      .m3-state-hover:hover::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: currentColor;
        opacity: var(--m3-state-hover);
        pointer-events: none;
        border-radius: inherit;
      }
      
      .m3-state-focus:focus-visible::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: currentColor;
        opacity: var(--m3-state-focus);
        pointer-events: none;
        border-radius: inherit;
      }
      
      .m3-state-pressed:active::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: currentColor;
        opacity: var(--m3-state-pressed);
        pointer-events: none;
        border-radius: inherit;
      }
      
      /* 涟漪效果 */
      .m3-ripple {
        position: absolute;
        border-radius: 50%;
        background-color: currentColor;
        opacity: 0.2;
        animation: m3-ripple 600ms var(--m3-motion-easing-standard);
        transform: scale(0);
      }
      
      @keyframes m3-ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      /* 可访问性 */
      .m3-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .m3-focus-ring:focus-visible {
        outline: 2px solid var(--m3-sys-primary);
        outline-offset: 2px;
      }
      
      /* 响应式断点 */
      @media (max-width: 599px) {
        .m3-mobile-hidden { display: none !important; }
        .m3-mobile-flex { display: flex !important; }
        .m3-mobile-block { display: block !important; }
      }
      
      @media (min-width: 600px) and (max-width: 904px) {
        .m3-tablet-hidden { display: none !important; }
        .m3-tablet-flex { display: flex !important; }
        .m3-tablet-block { display: block !important; }
      }
      
      @media (min-width: 905px) {
        .m3-desktop-hidden { display: none !important; }
        .m3-desktop-flex { display: flex !important; }
        .m3-desktop-block { display: block !important; }
      }
    `;
    
    document.head.appendChild(style);
    this.stylesheets.add(style);
  }
  
  /**
   * 设置主题监听器
   */
  setupThemeListener() {
    window.addEventListener('m3-theme-change', (event) => {
      // 通知所有组件主题已变化
      this.components.forEach((component, name) => {
        if (component.onThemeChange) {
          component.onThemeChange(event.detail);
        }
      });
      
      // 执行注册的回调
      if (this.listeners.has('theme-change')) {
        this.listeners.get('theme-change').forEach(callback => {
          callback(event.detail);
        });
      }
    });
  }
  
  /**
   * 注册组件
   * @param {string} name - 组件名称
   * @param {CustomElementConstructor} constructor - 组件构造函数
   * @param {Object} options - 自定义元素选项
   */
  registerComponent(name, constructor, options = {}) {
    if (customElements.get(name)) {
      console.warn(`Component ${name} is already registered`);
      return;
    }
    
    try {
      customElements.define(name, constructor, options);
      this.components.set(name, constructor);
      
      console.log(`Component ${name} registered successfully`);
    } catch (error) {
      console.error(`Failed to register component ${name}:`, error);
    }
  }
  
  /**
   * 批量注册组件
   * @param {Object} components - 组件映射
   */
  registerComponents(components) {
    Object.entries(components).forEach(([name, constructor]) => {
      this.registerComponent(name, constructor);
    });
  }
  
  /**
   * 检查组件是否已注册
   * @param {string} name - 组件名称
   * @returns {boolean}
   */
  isComponentRegistered(name) {
    return this.components.has(name) || customElements.get(name) !== undefined;
  }
  
  /**
   * 获取已注册组件列表
   * @returns {Array}
   */
  getRegisteredComponents() {
    return Array.from(this.components.keys());
  }
  
  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }
  
  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }
  
  /**
   * 创建涟漪效果
   * @param {Event} event - 触发事件
   * @param {HTMLElement} element - 目标元素
   */
  createRipple(event, element) {
    const rect = element.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('m3-ripple');
    
    const ripple = element.querySelector('.m3-ripple');
    if (ripple) ripple.remove();
    
    element.appendChild(circle);
    
    setTimeout(() => circle.remove(), 600);
  }
  
  /**
   * 检查可访问性
   * @param {HTMLElement} element - 目标元素
   * @returns {Object} 可访问性报告
   */
  checkAccessibility(element) {
    const report = {
      hasRole: element.hasAttribute('role'),
      hasLabel: element.hasAttribute('aria-label') || 
                element.hasAttribute('aria-labelledby') ||
                element.textContent.trim().length > 0,
      hasFocusable: element.hasAttribute('tabindex') && 
                    element.getAttribute('tabindex') !== '-1',
      contrastRatio: null,
      issues: []
    };
    
    // 检查对比度
    const bgColor = getComputedStyle(element).backgroundColor;
    const textColor = getComputedStyle(element).color;
    
    if (bgColor && textColor && bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
      // 简化对比度检查
      const bgLuminance = this.calculateLuminance(bgColor);
      const textLuminance = this.calculateLuminance(textColor);
      const lighter = Math.max(bgLuminance, textLuminance);
      const darker = Math.min(bgLuminance, textLuminance);
      report.contrastRatio = (lighter + 0.05) / (darker + 0.05);
      
      if (report.contrastRatio < 4.5) {
        report.issues.push('对比度不足 (WCAG AA)');
      }
    }
    
    // 检查键盘导航
    if (element.tabIndex < 0 && !element.hasAttribute('disabled')) {
      report.issues.push('无法通过键盘访问');
    }
    
    // 检查ARIA属性
    if (element.hasAttribute('aria-disabled') === 'true' && !element.hasAttribute('disabled')) {
      report.issues.push('ARIA状态与实际状态不一致');
    }
    
    return report;
  }
  
  /**
   * 计算颜色亮度
   * @param {string} color - CSS颜色值
   * @returns {number} 相对亮度
   */
  calculateLuminance(color) {
    // 简化版本，实际应使用完整算法
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0.5;
    
    const [r, g, b] = rgb.map(Number);
    const rsrgb = r / 255;
    const gsrgb = g / 255;
    const bsrgb = b / 255;
    
    const rLinear = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
    const gLinear = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
    const bLinear = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
  
  /**
   * 格式化CSS自定义属性
   * @param {Object} properties - 属性对象
   * @returns {string} CSS字符串
   */
  formatCSSProperties(properties) {
    return Object.entries(properties)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
  }
  
  /**
   * 获取设计令牌值
   * @param {string} token - 令牌名称
   * @returns {string} 令牌值
   */
  getTokenValue(token) {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(`--m3-${token}`).trim();
  }
  
  /**
   * 设置设计令牌值
   * @param {string} token - 令牌名称
   * @param {string} value - 令牌值
   */
  setTokenValue(token, value) {
    const root = document.documentElement;
    root.style.setProperty(`--m3-${token}`, value);
  }
  
  /**
   * 初始化所有组件
   */
  initialize() {
    console.log('M3 UI Library initialized');
    console.log('Available components:', this.getRegisteredComponents());
    
    // 触发初始化事件
    window.dispatchEvent(new CustomEvent('m3-initialized', {
      detail: {
        version: '1.0.0',
        components: this.getRegisteredComponents(),
        theme: window.M3Theme ? window.M3Theme.getThemeInfo() : null
      }
    }));
  }
  
  /**
   * 创建演示沙盒
   * @param {HTMLElement} container - 容器元素
   * @param {Object} config - 配置选项
   */
  createSandbox(container, config = {}) {
    const sandbox = document.createElement('div');
    sandbox.className = 'm3-sandbox';
    
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = 'var(--m3-shape-corner-medium)';
    
    // 构建沙盒内容
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="${config.cssUrl || 'css/m3-tokens.css'}">
        <link rel="stylesheet" href="${config.coreCssUrl || 'css/m3-core.css'}">
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: var(--m3-sys-surface);
            color: var(--m3-sys-on-surface);
            font-family: var(--m3-typescale-family);
          }
        </style>
      </head>
      <body>
        <div id="sandbox-content">${config.content || ''}</div>
        <script src="${config.jsUrl || 'js/m3-core.js'}"></script>
        ${config.scripts || ''}
      </body>
      </html>
    `;
    
    sandbox.appendChild(iframe);
    container.appendChild(sandbox);
    
    // 写入内容
    setTimeout(() => {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();
    }, 100);
    
    return {
      updateContent: (content) => {
        const doc = iframe.contentWindow.document;
        const contentEl = doc.getElementById('sandbox-content');
        if (contentEl) {
          contentEl.innerHTML = content;
        }
      },
      executeScript: (script) => {
        try {
          iframe.contentWindow.eval(script);
        } catch (e) {
          console.error('Sandbox script error:', e);
        }
      }
    };
  }
}

// 创建全局实例
window.M3 = new M3Core();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  window.M3.initialize();
});