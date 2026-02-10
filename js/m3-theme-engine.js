/**
 * Material Design 3 - 增强版主题引擎
 * 支持动态色彩、壁纸取色、主题保存等高级功能
 */
class M3ThemeEngine {
  constructor() {
    this.currentSeed = '#6750A4';
    this.isDark = false;
    this.customSchemes = new Map();
    this.currentScheme = null;
    
    // 初始化CSS变量
    this.initCSSVariables();
    
    // 监听系统主题变化
    this.watchSystemTheme();
  }
  
  /**
   * 初始化CSS变量
   */
  initCSSVariables() {
    const root = document.documentElement;
    
    // 确保所有CSS变量都已定义
    const defaultScheme = this.generateSchemeFromSeed(this.currentSeed, this.isDark);
    this.applyScheme(defaultScheme);
  }
  
  /**
   * 从种子色生成完整色彩方案
   * @param {string} seedColor - 种子颜色
   * @param {boolean} isDark - 是否为暗色模式
   * @returns {Object} 色彩方案
   */
  generateSchemeFromSeed(seedColor, isDark = false) {
    this.currentSeed = seedColor;
    this.isDark = isDark;
    
    // 使用HCT算法生成方案
    const scheme = M3ColorExtractor.generateSchemeFromColor(seedColor, isDark);
    this.currentScheme = scheme;
    
    // 保存到自定义方案
    const schemeKey = `${seedColor}-${isDark ? 'dark' : 'light'}`;
    this.customSchemes.set(schemeKey, scheme);
    
    return scheme;
  }
  
  /**
   * 从图片生成色彩方案
   * @param {string} imageUrl - 图片URL
   * @param {boolean} isDark - 是否为暗色模式
   * @param {Function} callback - 回调函数
   */
  generateSchemeFromImage(imageUrl, isDark = false, callback) {
    M3ColorExtractor.extractFromImageUrl(imageUrl, (colors) => {
      if (colors.length === 0) {
        console.error('未能从图片中提取颜色');
        if (callback) callback(null);
        return;
      }
      
      const primaryColor = M3ColorExtractor.extractPrimaryColor(colors);
      const scheme = this.generateSchemeFromSeed(primaryColor, isDark);
      
      // 保存图片相关信息
      scheme.source = 'image';
      scheme.imageUrl = imageUrl;
      scheme.extractedColors = colors;
      
      if (callback) callback(scheme);
    });
  }
  
  /**
   * 应用色彩方案到页面
   * @param {Object} scheme - 色彩方案
   */
  applyScheme(scheme) {
    if (!scheme) return;
    
    this.currentScheme = scheme;
    const root = document.documentElement;
    
    // 应用所有色彩变量
    Object.entries(scheme).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('#')) {
        const cssVar = `--m3-sys-${this.kebabCase(key)}`;
        root.style.setProperty(cssVar, value);
      }
    });
    
    // 设置主题模式
    const isDark = scheme.surface && 
                  M3HCTColor.relativeLuminance(
                    ...Object.values(M3HCTColor.hexToRgb(scheme.surface))
                  ) < 0.5;
    
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      this.isDark = true;
    } else {
      root.removeAttribute('data-theme');
      this.isDark = false;
    }
    
    // 提取种子色（从primary）
    if (scheme.primary) {
      this.currentSeed = scheme.primary;
    }
    
    // 保存到本地存储
    this.saveToLocalStorage();
    
    // 触发主题变化事件
    this.dispatchThemeChange();
  }
  
  /**
   * 切换亮色/暗色模式
   * @param {boolean} forceDark - 强制暗色模式
   */
  toggleTheme(forceDark = null) {
    const willBeDark = forceDark !== null ? forceDark : !this.isDark;
    
    if (this.currentScheme) {
      // 基于当前方案生成相反模式
      const currentSeed = this.currentSeed;
      const newScheme = this.generateSchemeFromSeed(currentSeed, willBeDark);
      this.applyScheme(newScheme);
    } else {
      // 生成新方案
      const newScheme = this.generateSchemeFromSeed(this.currentSeed, willBeDark);
      this.applyScheme(newScheme);
    }
  }
  
  /**
   * 应用图片主题
   * @param {string} imageUrl - 图片URL
   * @param {boolean} isDark - 是否为暗色模式
   */
  applyImageTheme(imageUrl, isDark = null) {
    const willBeDark = isDark !== null ? isDark : this.isDark;
    
    this.generateSchemeFromImage(imageUrl, willBeDark, (scheme) => {
      if (scheme) {
        this.applyScheme(scheme);
        
        // 保存图片到本地存储
        localStorage.setItem('m3-wallpaper-url', imageUrl);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('m3-wallpaper-applied', {
          detail: { imageUrl, scheme }
        }));
      }
    });
  }
  
  /**
   * 获取当前主题信息
   * @returns {Object} 主题信息
   */
  getThemeInfo() {
    return {
      seed: this.currentSeed,
      isDark: this.isDark,
      scheme: this.currentScheme,
      customSchemes: Array.from(this.customSchemes.keys())
    };
  }
  
  /**
   * 获取对比色
   * @param {string} color - 基础颜色
   * @param {boolean} highContrast - 是否需要高对比度
   * @returns {string} 对比色
   */
  getContrastColor(color, highContrast = false) {
    return M3HCTColor.getAccessibleTextColor(color);
  }
  
  /**
   * 生成调色板
   * @param {string} baseColor - 基础颜色
   * @param {number} steps - 步数
   * @returns {Array} 调色板
   */
  generatePalette(baseColor, steps = 10) {
    const hctColor = M3HCTColor.fromHex(baseColor);
    return M3HCTColor.generateTonalPalette(hctColor);
  }
  
  /**
   * 保存到本地存储
   */
  saveToLocalStorage() {
    const themeData = {
      seed: this.currentSeed,
      isDark: this.isDark,
      scheme: this.currentScheme,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('m3-theme-data', JSON.stringify(themeData));
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }
  
  /**
   * 从本地存储加载
   * @returns {Object|null} 主题数据
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('m3-theme-data');
      if (saved) {
        const themeData = JSON.parse(saved);
        
        // 验证数据有效性
        if (themeData.scheme && themeData.seed) {
          this.currentSeed = themeData.seed;
          this.isDark = themeData.isDark || false;
          this.currentScheme = themeData.scheme;
          
          // 应用方案
          this.applyScheme(themeData.scheme);
          
          return themeData;
        }
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage:', e);
    }
    
    return null;
  }
  
  /**
   * 重置为默认主题
   */
  resetToDefault() {
    const defaultScheme = this.generateSchemeFromSeed('#6750A4', false);
    this.applyScheme(defaultScheme);
    
    // 清除本地存储
    localStorage.removeItem('m3-theme-data');
    localStorage.removeItem('m3-wallpaper-url');
  }
  
  /**
   * 监听系统主题变化
   */
  watchSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 如果没有手动设置过主题，跟随系统
    const hasManualTheme = localStorage.getItem('m3-theme-data');
    
    if (!hasManualTheme) {
      // 初始设置
      if (prefersDark.matches) {
        this.toggleTheme(true);
      }
      
      // 监听变化
      prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('m3-theme-data')) {
          this.toggleTheme(e.matches);
        }
      });
    }
  }
  
  /**
   * 导出主题配置
   * @param {string} format - 格式 (json, css, scss)
   * @returns {string} 配置文本
   */
  exportTheme(format = 'json') {
    if (!this.currentScheme) return '';
    
    switch (format.toLowerCase()) {
      case 'css':
        return this.exportAsCSS();
      case 'scss':
        return this.exportAsSCSS();
      case 'json':
      default:
        return JSON.stringify(this.getThemeInfo(), null, 2);
    }
  }
  
  /**
   * 导出为CSS变量
   * @returns {string} CSS代码
   */
  exportAsCSS() {
    if (!this.currentScheme) return '';
    
    const vars = Object.entries(this.currentScheme)
      .filter(([_, value]) => typeof value === 'string' && value.startsWith('#'))
      .map(([key, value]) => {
        const cssVar = `--m3-sys-${this.kebabCase(key)}`;
        return `  ${cssVar}: ${value};`;
      })
      .join('\n');
    
    return `:root {\n${vars}\n}`;
  }
  
  /**
   * 导出为SCSS变量
   * @returns {string} SCSS代码
   */
  exportAsSCSS() {
    if (!this.currentScheme) return '';
    
    return Object.entries(this.currentScheme)
      .filter(([_, value]) => typeof value === 'string' && value.startsWith('#'))
      .map(([key, value]) => {
        const scssVar = `$m3-${this.kebabCase(key)}`;
        return `${scssVar}: ${value};`;
      })
      .join('\n');
  }
  
  /**
   * 触发主题变化事件
   */
  dispatchThemeChange() {
    window.dispatchEvent(new CustomEvent('m3-theme-change', {
      detail: this.getThemeInfo()
    }));
  }
  
  /**
   * 转换为kebab-case
   * @param {string} str - 输入字符串
   * @returns {string} kebab-case字符串
   */
  kebabCase(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }
  
  /**
   * 创建主题控制界面
   * @param {HTMLElement} container - 容器元素
   * @returns {Object} 界面控制对象
   */
  createThemeControllerUI(container) {
    const html = `
      <div class="m3-theme-controller">
        <div class="m3-controller-header">
          <h3>Material You 主题控制器</h3>
          <div class="m3-theme-status">
            <span class="m3-status-indicator" id="m3-theme-indicator"></span>
            <span id="m3-theme-status-text">动态主题</span>
          </div>
        </div>
        
        <div class="m3-controller-sections">
          <!-- 基础控制 -->
          <div class="m3-control-section">
            <h4>基础设置</h4>
            
            <div class="m3-control-group">
              <label class="m3-control-label">主题模式</label>
              <div class="m3-control-buttons">
                <button class="m3-button ${!this.isDark ? 'tonal' : 'outlined'}" 
                        id="m3-theme-light">
                  亮色模式
                </button>
                <button class="m3-button ${this.isDark ? 'tonal' : 'outlined'}" 
                        id="m3-theme-dark">
                  暗色模式
                </button>
                <button class="m3-button outlined" id="m3-theme-auto">
                  跟随系统
                </button>
              </div>
            </div>
            
            <div class="m3-control-group">
              <label class="m3-control-label">种子颜色</label>
              <div class="m3-color-inputs">
                <input type="color" 
                       class="m3-color-picker" 
                       id="m3-seed-color" 
                       value="${this.currentSeed}"
                       title="选择种子颜色">
                <input type="text" 
                       class="m3-text-field" 
                       id="m3-seed-hex" 
                       value="${this.currentSeed}"
                       placeholder="#RRGGBB">
                <button class="m3-button" id="m3-apply-seed">
                  应用颜色
                </button>
              </div>
            </div>
            
            <div class="m3-preset-colors" id="m3-preset-colors">
              <div class="m3-preset-title">预设颜色</div>
              <div class="m3-preset-grid">
                <button class="m3-preset-color" style="background-color: #6750A4;" 
                        data-color="#6750A4" title="Material Purple"></button>
                <button class="m3-preset-color" style="background-color: #00796B;" 
                        data-color="#00796B" title="Material Teal"></button>
                <button class="m3-preset-color" style="background-color: #D32F2F;" 
                        data-color="#D32F2F" title="Material Red"></button>
                <button class="m3-preset-color" style="background-color: #1976D2;" 
                        data-color="#1976D2" title="Material Blue"></button>
                <button class="m3-preset-color" style="background-color: #388E3C;" 
                        data-color="#388E3C" title="Material Green"></button>
                <button class="m3-preset-color" style="background-color: #F57C00;" 
                        data-color="#F57C00" title="Material Orange"></button>
                <button class="m3-preset-color" style="background-color: #7B1FA2;" 
                        data-color="#7B1FA2" title="Material Deep Purple"></button>
                <button class="m3-preset-color" style="background-color: #0288D1;" 
                        data-color="#0288D1" title="Material Light Blue"></button>
              </div>
            </div>
          </div>
          
          <!-- 壁纸取色 -->
          <div class="m3-control-section">
            <h4>壁纸取色</h4>
            
            <div class="m3-wallpaper-controls">
              <div class="m3-wallpaper-input">
                <input type="url" 
                       class="m3-text-field" 
                       id="m3-wallpaper-url" 
                       placeholder="输入壁纸URL">
                <label class="m3-file-input">
                  <input type="file" 
                         id="m3-wallpaper-file" 
                         accept="image/*" 
                         style="display: none;">
                  选择壁纸
                </label>
              </div>
              
              <div class="m3-wallpaper-actions">
                <button class="m3-button" id="m3-apply-wallpaper">
                  <span class="m3-button-icon">🎨</span>
                  应用壁纸色彩
                </button>
                <button class="m3-button outlined" id="m3-clear-wallpaper">
                  清除壁纸
                </button>
              </div>
            </div>
            
            <div class="m3-wallpaper-preview" id="m3-wallpaper-preview">
              <!-- 壁纸预览将动态生成 -->
            </div>
          </div>
          
          <!-- 高级设置 -->
          <div class="m3-control-section">
            <h4>高级设置</h4>
            
            <div class="m3-control-group">
              <label class="m3-control-label">色彩对比度</label>
              <div class="m3-slider-container">
                <input type="range" 
                       class="m3-slider" 
                       id="m3-contrast-slider" 
                       min="1" max="3" step="0.1" value="1">
                <span class="m3-slider-value" id="m3-contrast-value">标准</span>
              </div>
            </div>
            
            <div class="m3-control-group">
              <label class="m3-control-label">
                <input type="checkbox" id="m3-reduce-motion">
                减少动画效果
              </label>
            </div>
            
            <div class="m3-control-group">
              <label class="m3-control-label">
                <input type="checkbox" id="m3-high-contrast">
                高对比度模式
              </label>
            </div>
          </div>
          
          <!-- 导入导出 -->
          <div class="m3-control-section">
            <h4>导入/导出</h4>
            
            <div class="m3-import-export">
              <button class="m3-button outlined" id="m3-export-theme">
                <span class="m3-button-icon">📤</span>
                导出主题
              </button>
              <button class="m3-button outlined" id="m3-import-theme">
                <span class="m3-button-icon">📥</span>
                导入主题
              </button>
              <button class="m3-button" id="m3-reset-theme">
                <span class="m3-button-icon">🔄</span>
                重置主题
              </button>
            </div>
            
            <div class="m3-export-format">
              <label class="m3-radio-label">
                <input type="radio" name="export-format" value="json" checked>
                JSON
              </label>
              <label class="m3-radio-label">
                <input type="radio" name="export-format" value="css">
                CSS变量
              </label>
              <label class="m3-radio-label">
                <input type="radio" name="export-format" value="scss">
                SCSS变量
              </label>
            </div>
          </div>
        </div>
        
        <div class="m3-controller-footer">
          <div class="m3-current-scheme" id="m3-current-scheme">
            <!-- 当前方案预览将动态生成 -->
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // 初始化事件监听
    this.initControllerEvents(container);
    
    // 更新界面状态
    this.updateControllerUI(container);
    
    return {
      refresh: () => this.updateControllerUI(container),
      getConfig: () => this.getThemeInfo()
    };
  }
  
  /**
   * 初始化控制器事件
   * @param {HTMLElement} container - 容器元素
   */
  initControllerEvents(container) {
    // 主题模式切换
    container.querySelector('#m3-theme-light').addEventListener('click', () => {
      this.toggleTheme(false);
      this.updateControllerUI(container);
    });
    
    container.querySelector('#m3-theme-dark').addEventListener('click', () => {
      this.toggleTheme(true);
      this.updateControllerUI(container);
    });
    
    container.querySelector('#m3-theme-auto').addEventListener('click', () => {
      localStorage.removeItem('m3-theme-data');
      this.watchSystemTheme();
      this.updateControllerUI(container);
    });
    
    // 种子颜色
    const seedColorPicker = container.querySelector('#m3-seed-color');
    const seedHexInput = container.querySelector('#m3-seed-hex');
    const applySeedBtn = container.querySelector('#m3-apply-seed');
    
    seedColorPicker.addEventListener('input', (e) => {
      seedHexInput.value = e.target.value;
    });
    
    seedHexInput.addEventListener('change', (e) => {
      const hex = e.target.value;
      if (/^#[0-9A-F]{6}$/i.test(hex)) {
        seedColorPicker.value = hex;
      }
    });
    
    applySeedBtn.addEventListener('click', () => {
      const seedColor = seedHexInput.value;
      if (/^#[0-9A-F]{6}$/i.test(seedColor)) {
        const scheme = this.generateSchemeFromSeed(seedColor, this.isDark);
        this.applyScheme(scheme);
        this.updateControllerUI(container);
      }
    });
    
    // 预设颜色
    container.querySelectorAll('.m3-preset-color').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        seedColorPicker.value = color;
        seedHexInput.value = color;
        
        const scheme = this.generateSchemeFromSeed(color, this.isDark);
        this.applyScheme(scheme);
        this.updateControllerUI(container);
      });
    });
    
    // 壁纸控制
    const wallpaperFile = container.querySelector('#m3-wallpaper-file');
    const wallpaperUrl = container.querySelector('#m3-wallpaper-url');
    const applyWallpaperBtn = container.querySelector('#m3-apply-wallpaper');
    const clearWallpaperBtn = container.querySelector('#m3-clear-wallpaper');
    
    wallpaperFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          wallpaperUrl.value = event.target.result;
          this.updateWallpaperPreview(container, event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
    
    applyWallpaperBtn.addEventListener('click', () => {
      const imageUrl = wallpaperUrl.value;
      if (imageUrl) {
        this.applyImageTheme(imageUrl);
        this.updateControllerUI(container);
      }
    });
    
    clearWallpaperBtn.addEventListener('click', () => {
      wallpaperFile.value = '';
      wallpaperUrl.value = '';
      container.querySelector('#m3-wallpaper-preview').innerHTML = '';
      localStorage.removeItem('m3-wallpaper-url');
    });
    
    // 高级设置
    const contrastSlider = container.querySelector('#m3-contrast-slider');
    const contrastValue = container.querySelector('#m3-contrast-value');
    
    contrastSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      contrastValue.textContent = value === 1 ? '标准' : 
                                 value === 2 ? '增强' : 
                                 '最大';
      
      // 应用对比度设置
      document.documentElement.style.setProperty(
        '--m3-contrast-multiplier', 
        value
      );
    });
    
    // 导入导出
    container.querySelector('#m3-export-theme').addEventListener('click', () => {
      const format = container.querySelector('input[name="export-format"]:checked').value;
      const exported = this.exportTheme(format);
      
      // 创建下载
      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `m3-theme-${new Date().getTime()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    });
    
    container.querySelector('#m3-reset-theme').addEventListener('click', () => {
      if (confirm('确定要重置主题为默认设置吗？')) {
        this.resetToDefault();
        this.updateControllerUI(container);
      }
    });
    
    // 监听主题变化事件
    window.addEventListener('m3-theme-change', () => {
      this.updateControllerUI(container);
    });
  }
  
  /**
   * 更新控制器界面
   * @param {HTMLElement} container - 容器元素
   */
  updateControllerUI(container) {
    // 更新主题指示器
    const indicator = container.querySelector('#m3-theme-indicator');
    const statusText = container.querySelector('#m3-theme-status-text');
    
    if (this.isDark) {
      indicator.style.backgroundColor = '#000';
      statusText.textContent = '暗色模式';
    } else {
      indicator.style.backgroundColor = '#FFF';
      statusText.textContent = '亮色模式';
    }
    
    // 更新颜色输入
    container.querySelector('#m3-seed-color').value = this.currentSeed;
    container.querySelector('#m3-seed-hex').value = this.currentSeed;
    
    // 更新按钮状态
    const lightBtn = container.querySelector('#m3-theme-light');
    const darkBtn = container.querySelector('#m3-theme-dark');
    
    if (this.isDark) {
      lightBtn.className = 'm3-button outlined';
      darkBtn.className = 'm3-button tonal';
    } else {
      lightBtn.className = 'm3-button tonal';
      darkBtn.className = 'm3-button outlined';
    }
    
    // 更新当前方案预览
    this.updateCurrentSchemePreview(container);
    
    // 检查是否有壁纸
    const wallpaperUrl = localStorage.getItem('m3-wallpaper-url');
    if (wallpaperUrl) {
      container.querySelector('#m3-wallpaper-url').value = wallpaperUrl;
      this.updateWallpaperPreview(container, wallpaperUrl);
    }
  }
  
  /**
   * 更新当前方案预览
   * @param {HTMLElement} container - 容器元素
   */
  updateCurrentSchemePreview(container) {
    const preview = container.querySelector('#m3-current-scheme');
    
    if (!this.currentScheme) return;
    
    // 显示主要颜色
    const mainColors = ['primary', 'secondary', 'tertiary', 'surface', 'error'];
    const colorItems = mainColors.map(key => {
      const color = this.currentScheme[key];
      if (!color) return '';
      
      const textColor = this.getContrastColor(color);
      return `
        <div class="m3-scheme-preview-color" 
             style="background-color: ${color}; color: ${textColor};"
             title="${key}: ${color}">
          <span class="m3-preview-color-name">${key}</span>
        </div>
      `;
    }).join('');
    
    preview.innerHTML = `
      <div class="m3-scheme-preview-title">当前色彩方案</div>
      <div class="m3-scheme-preview-colors">
        ${colorItems}
      </div>
      <div class="m3-scheme-preview-info">
        种子色: <span style="color: ${this.currentSeed}">${this.currentSeed}</span>
        • 模式: ${this.isDark ? '暗色' : '亮色'}
      </div>
    `;
  }
  
  /**
   * 更新壁纸预览
   * @param {HTMLElement} container - 容器元素
   * @param {string} imageUrl - 图片URL
   */
  updateWallpaperPreview(container, imageUrl) {
    const preview = container.querySelector('#m3-wallpaper-preview');
    
    preview.innerHTML = `
      <div class="m3-wallpaper-image">
        <img src="${imageUrl}" alt="壁纸预览">
      </div>
      <div class="m3-wallpaper-info">
        <span class="m3-info-icon">🖼️</span>
        壁纸已加载
      </div>
    `;
  }
}

// 创建全局实例
window.M3Theme = new M3ThemeEngine();

// 自动加载保存的主题
document.addEventListener('DOMContentLoaded', () => {
  window.M3Theme.loadFromLocalStorage();
});