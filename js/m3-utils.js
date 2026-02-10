// Material Design 3 - 工具函数库

/**
 * 颜色工具函数
 */
const M3ColorUtils = {
  // 十六进制转RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  // RGB转十六进制
  rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase();
  },
  
  // 计算颜色亮度
  calculateLuminance(r, g, b) {
    const rsrgb = r / 255;
    const gsrgb = g / 255;
    const bsrgb = b / 255;
    
    const rLinear = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
    const gLinear = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
    const bLinear = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  },
  
  // 计算对比度
  contrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const luminance1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },
  
  // 获取可访问性文本颜色
  getAccessibleTextColor(backgroundColor) {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
    
    // 根据亮度选择黑色或白色
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
};

/**
 * DOM工具函数
 */
const M3DOMUtils = {
  // 安全地创建元素
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  // 等待元素存在
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },
  
  // 动画工具
  animate(element, keyframes, options) {
    return element.animate(keyframes, {
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'both',
      ...options
    });
  }
};

/**
 * 表单工具函数
 */
const M3FormUtils = {
  // 验证电子邮件
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // 验证URL
  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // 获取表单数据
  getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  },
  
  // 重置表单
  resetForm(formElement) {
    formElement.reset();
    
    // 触发自定义事件
    const event = new CustomEvent('m3-form-reset', {
      bubbles: true,
      detail: { form: formElement }
    });
    formElement.dispatchEvent(event);
  }
};

/**
 * 存储工具函数
 */
const M3StorageUtils = {
  // 安全地存储数据
  setItem(key, value, ttl = null) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`m3-${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  },
  
  // 安全地获取数据
  getItem(key) {
    try {
      const item = localStorage.getItem(`m3-${key}`);
      if (!item) return null;
      
      const data = JSON.parse(item);
      
      // 检查是否过期
      if (data.ttl && Date.now() - data.timestamp > data.ttl) {
        localStorage.removeItem(`m3-${key}`);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },
  
  // 移除数据
  removeItem(key) {
    try {
      localStorage.removeItem(`m3-${key}`);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  },
  
  // 清空所有M3相关数据
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('m3-')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear M3 data:', error);
      return false;
    }
  }
};

/**
 * 响应式工具函数
 */
const M3ResponsiveUtils = {
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 905,
    lg: 1240,
    xl: 1440
  },
  
  // 获取当前断点
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= this.breakpoints.xl) return 'xl';
    if (width >= this.breakpoints.lg) return 'lg';
    if (width >= this.breakpoints.md) return 'md';
    if (width >= this.breakpoints.sm) return 'sm';
    return 'xs';
  },
  
  // 监听断点变化
  onBreakpointChange(callback) {
    let currentBreakpoint = this.getCurrentBreakpoint();
    
    const checkBreakpoint = () => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint;
        callback(newBreakpoint);
      }
    };
    
    window.addEventListener('resize', checkBreakpoint);
    
    // 返回取消监听函数
    return () => {
      window.removeEventListener('resize', checkBreakpoint);
    };
  },
  
  // 检查是否在特定断点以上
  isAbove(breakpoint) {
    const width = window.innerWidth;
    return width >= this.breakpoints[breakpoint];
  },
  
  // 检查是否在特定断点以下
  isBelow(breakpoint) {
    const width = window.innerWidth;
    return width < this.breakpoints[breakpoint];
  }
};

/**
 * 性能工具函数
 */
const M3PerformanceUtils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // 测量函数执行时间
  measureTime(name, func) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }
};

// 导出所有工具
window.M3Utils = {
  color: M3ColorUtils,
  dom: M3DOMUtils,
  form: M3FormUtils,
  storage: M3StorageUtils,
  responsive: M3ResponsiveUtils,
  performance: M3PerformanceUtils
};