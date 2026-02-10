/**
 * Material Design 3 - 壁纸色彩提取器
 * 从图片中提取主色调并生成动态色彩方案
 */
class M3ColorExtractor {
  /**
   * 从图片URL提取主色调
   * @param {string} imageUrl - 图片URL
   * @param {Function} callback - 回调函数
   * @param {number} colorCount - 提取颜色数量
   */
  static extractFromImageUrl(imageUrl, callback, colorCount = 5) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const colors = this.extractFromImage(img, colorCount);
      callback(colors);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      callback([]);
    };
    
    img.src = imageUrl;
  }

  /**
   * 从图片元素提取颜色
   * @param {HTMLImageElement} img - 图片元素
   * @param {number} colorCount - 提取颜色数量
   * @returns {Array} 颜色数组
   */
  static extractFromImage(img, colorCount = 5) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置Canvas尺寸
    canvas.width = 100; // 缩小以提高性能
    canvas.height = Math.round((img.height / img.width) * 100);
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // 提取颜色
    return this.extractColorsFromPixels(pixels, colorCount);
  }

  /**
   * 从像素数据提取颜色
   * @param {Uint8ClampedArray} pixels - 像素数据
   * @param {number} colorCount - 提取颜色数量
   * @returns {Array} 颜色数组
   */
  static extractColorsFromPixels(pixels, colorCount) {
    // 量化颜色（简化版中位切割算法）
    const colorMap = new Map();
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // 忽略透明像素
      if (pixels[i + 3] < 128) continue;
      
      // 量化到16个级别
      const quantizedR = Math.floor(r / 16) * 16;
      const quantizedG = Math.floor(g / 16) * 16;
      const quantizedB = Math.floor(b / 16) * 16;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    // 按频率排序
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount * 2); // 取两倍数量进行过滤
    
    // 过滤相似颜色
    const distinctColors = [];
    for (const [colorKey] of sortedColors) {
      const [r, g, b] = colorKey.split(',').map(Number);
      const hexColor = M3HCTColor.rgbToHex(r, g, b);
      
      // 检查是否与已有颜色太相似
      const isDistinct = distinctColors.every(existingColor => {
        const contrast = M3HCTColor.contrastRatio(hexColor, existingColor);
        return contrast > 1.5; // 最小对比度阈值
      });
      
      if (isDistinct) {
        distinctColors.push(hexColor);
        if (distinctColors.length >= colorCount) break;
      }
    }
    
    return distinctColors;
  }

  /**
   * 提取最适合作为主色调的颜色
   * @param {Array} colors - 颜色数组
   * @returns {string} 主色调
   */
  static extractPrimaryColor(colors) {
    if (colors.length === 0) return '#6750A4'; // 默认颜色
    
    // 评估每个颜色的"适合度"
    const scoredColors = colors.map(color => {
      const hct = M3HCTColor.fromHex(color);
      const rgb = M3HCTColor.hexToRgb(color);
      
      let score = 0;
      
      // 1. 色度得分（中等色度最好）
      if (hct.chroma > 20 && hct.chroma < 60) score += 30;
      
      // 2. 明度得分（中等明度最好）
      if (hct.tone > 30 && hct.tone < 70) score += 30;
      
      // 3. 饱和度得分（RGB最大差值）
      const maxComponent = Math.max(rgb.r, rgb.g, rgb.b);
      const minComponent = Math.min(rgb.r, rgb.g, rgb.b);
      const saturation = (maxComponent - minComponent) / maxComponent;
      if (saturation > 0.3 && saturation < 0.8) score += 20;
      
      // 4. 排除不友好的颜色
      // 避免灰色
      if (Math.abs(rgb.r - rgb.g) < 30 && Math.abs(rgb.g - rgb.b) < 30) score -= 50;
      
      // 避免过亮或过暗
      if (hct.tone < 10 || hct.tone > 90) score -= 30;
      
      return { color, score };
    });
    
    // 选择得分最高的颜色
    scoredColors.sort((a, b) => b.score - a.score);
    return scoredColors[0].color;
  }

  /**
   * 从图片生成完整的Material You色彩方案
   * @param {HTMLImageElement} img - 图片元素
   * @returns {Object} 色彩方案
   */
  static generateColorSchemeFromImage(img) {
    const colors = this.extractFromImage(img, 8);
    const primaryColor = this.extractPrimaryColor(colors);
    
    // 使用HCT算法生成完整调色板
    const hctColor = M3HCTColor.fromHex(primaryColor);
    const dynamicPalette = M3HCTColor.generateDynamicPalette(primaryColor);
    
    return {
      primary: primaryColor,
      colors: colors,
      palette: dynamicPalette.palette,
      scheme: {
        light: this.generateSchemeFromColor(primaryColor, false),
        dark: this.generateSchemeFromColor(primaryColor, true)
      }
    };
  }

  /**
   * 从颜色生成色彩方案
   * @param {string} primaryColor - 主色调
   * @param {boolean} isDark - 是否为暗色模式
   * @returns {Object} 色彩方案
   */
  static generateSchemeFromColor(primaryColor, isDark = false) {
    const hctColor = M3HCTColor.fromHex(primaryColor);
    
    // 根据明暗模式调整
    const baseTone = isDark ? 20 : 80;
    const containerTone = isDark ? 30 : 90;
    const onColorTone = isDark ? 90 : 10;
    
    // 生成主要颜色
    const primary = hctColor.toHex();
    const primaryContainer = M3HCTColor.adjustTone(hctColor, containerTone - hctColor.tone).toHex();
    
    // 生成次要颜色（色调偏移60度）
    const secondary = M3HCTColor.adjustHue(hctColor, 60);
    const secondaryAdjusted = M3HCTColor.adjustTone(secondary, baseTone - secondary.tone);
    
    // 生成第三颜色（色调偏移120度）
    const tertiary = M3HCTColor.adjustHue(hctColor, 120);
    const tertiaryAdjusted = M3HCTColor.adjustTone(tertiary, baseTone - tertiary.tone);
    
    // 生成表面颜色
    const surfaceHct = new M3HCTColor(hctColor.hue, Math.max(0, hctColor.chroma - 40), isDark ? 10 : 99);
    
    return {
      primary: primary,
      onPrimary: M3HCTColor.getAccessibleTextColor(primary),
      primaryContainer: primaryContainer,
      onPrimaryContainer: M3HCTColor.getAccessibleTextColor(primaryContainer),
      
      secondary: secondaryAdjusted.toHex(),
      onSecondary: M3HCTColor.getAccessibleTextColor(secondaryAdjusted.toHex()),
      secondaryContainer: M3HCTColor.adjustTone(secondaryAdjusted, 10).toHex(),
      onSecondaryContainer: M3HCTColor.getAccessibleTextColor(
        M3HCTColor.adjustTone(secondaryAdjusted, 10).toHex()
      ),
      
      tertiary: tertiaryAdjusted.toHex(),
      onTertiary: M3HCTColor.getAccessibleTextColor(tertiaryAdjusted.toHex()),
      tertiaryContainer: M3HCTColor.adjustTone(tertiaryAdjusted, 10).toHex(),
      onTertiaryContainer: M3HCTColor.getAccessibleTextColor(
        M3HCTColor.adjustTone(tertiaryAdjusted, 10).toHex()
      ),
      
      surface: surfaceHct.toHex(),
      surfaceDim: M3HCTColor.adjustTone(surfaceHct, isDark ? -4 : -12).toHex(),
      surfaceBright: M3HCTColor.adjustTone(surfaceHct, isDark ? 14 : 4).toHex(),
      surfaceContainerLowest: M3HCTColor.adjustTone(surfaceHct, isDark ? 0 : 5).toHex(),
      surfaceContainerLow: M3HCTColor.adjustTone(surfaceHct, isDark ? 4 : 8).toHex(),
      surfaceContainer: M3HCTColor.adjustTone(surfaceHct, isDark ? 6 : 12).toHex(),
      surfaceContainerHigh: M3HCTColor.adjustTone(surfaceHct, isDark ? 8 : 16).toHex(),
      surfaceContainerHighest: M3HCTColor.adjustTone(surfaceHct, isDark ? 12 : 22).toHex(),
      
      onSurface: M3HCTColor.getAccessibleTextColor(surfaceHct.toHex()),
      onSurfaceVariant: M3HCTColor.adjustTone(surfaceHct, isDark ? 70 : 30).toHex(),
      
      outline: M3HCTColor.adjustTone(hctColor, isDark ? 60 : 50).toHex(),
      outlineVariant: M3HCTColor.adjustTone(hctColor, isDark ? 30 : 80).toHex(),
      
      // 固定错误色
      error: isDark ? '#F2B8B5' : '#BA1A1A',
      onError: isDark ? '#601410' : '#FFFFFF',
      errorContainer: isDark ? '#8C1D18' : '#FFDAD6',
      onErrorContainer: isDark ? '#F9DEDC' : '#410002'
    };
  }

  /**
   * 创建颜色提取界面
   * @param {HTMLElement} container - 容器元素
   * @returns {Object} 界面控制对象
   */
  static createColorExtractorUI(container) {
    const html = `
      <div class="m3-color-extractor">
        <div class="m3-extractor-header">
          <h3>壁纸色彩提取</h3>
          <p>上传图片或输入URL，自动提取主色调并生成Material You色彩方案</p>
        </div>
        
        <div class="m3-extractor-controls">
          <div class="m3-input-group">
            <input type="url" 
                   class="m3-text-field" 
                   id="m3-image-url" 
                   placeholder="输入图片URL或选择文件">
            <label class="m3-file-input">
              <input type="file" 
                     id="m3-image-file" 
                     accept="image/*" 
                     style="display: none;">
              选择文件
            </label>
          </div>
          
          <button class="m3-button" id="m3-extract-colors">
            <span class="m3-button-icon">🎨</span>
            提取色彩
          </button>
        </div>
        
        <div class="m3-extractor-preview">
          <div class="m3-image-preview" id="m3-image-preview">
            <div class="m3-placeholder">
              <span class="m3-placeholder-icon">🖼️</span>
              <p>图片预览区域</p>
            </div>
          </div>
          
          <div class="m3-color-results">
            <div class="m3-color-palette" id="m3-color-palette">
              <div class="m3-palette-placeholder">
                <span class="m3-placeholder-icon">🎨</span>
                <p>提取的颜色将显示在这里</p>
              </div>
            </div>
            
            <div class="m3-color-actions">
              <button class="m3-button outlined" id="m3-apply-light">
                应用亮色主题
              </button>
              <button class="m3-button outlined" id="m3-apply-dark">
                应用暗色主题
              </button>
              <button class="m3-button" id="m3-copy-scheme">
                复制色彩方案
              </button>
            </div>
          </div>
        </div>
        
        <div class="m3-scheme-preview" id="m3-scheme-preview">
          <!-- 色彩方案预览将通过JS动态生成 -->
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // 初始化事件监听
    this.initExtractorEvents(container);
    
    return {
      updatePreview: (imageUrl) => this.updateImagePreview(container, imageUrl),
      updateColors: (colors) => this.updateColorPalette(container, colors),
      updateScheme: (scheme) => this.updateSchemePreview(container, scheme)
    };
  }

  /**
   * 初始化提取器事件
   * @param {HTMLElement} container - 容器元素
   */
  static initExtractorEvents(container) {
    const fileInput = container.querySelector('#m3-image-file');
    const urlInput = container.querySelector('#m3-image-url');
    const extractBtn = container.querySelector('#m3-extract-colors');
    const applyLightBtn = container.querySelector('#m3-apply-light');
    const applyDarkBtn = container.querySelector('#m3-apply-dark');
    const copyBtn = container.querySelector('#m3-copy-scheme');
    
    let currentImageUrl = '';
    let currentColors = [];
    let currentScheme = null;
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentImageUrl = event.target.result;
          this.updateImagePreview(container, currentImageUrl);
          urlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
    
    // URL输入
    urlInput.addEventListener('change', () => {
      if (urlInput.value) {
        currentImageUrl = urlInput.value;
        this.updateImagePreview(container, currentImageUrl);
        fileInput.value = '';
      }
    });
    
    // 提取色彩
    extractBtn.addEventListener('click', () => {
      if (!currentImageUrl) {
        alert('请先选择或输入图片');
        return;
      }
      
      extractBtn.disabled = true;
      extractBtn.innerHTML = '<span class="m3-button-icon">⏳</span>提取中...';
      
      this.extractFromImageUrl(currentImageUrl, (colors) => {
        currentColors = colors;
        this.updateColorPalette(container, colors);
        
        // 生成色彩方案
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          currentScheme = this.generateColorSchemeFromImage(img);
          this.updateSchemePreview(container, currentScheme);
          
          extractBtn.disabled = false;
          extractBtn.innerHTML = '<span class="m3-button-icon">🎨</span>提取色彩';
        };
        img.src = currentImageUrl;
      });
    });
    
    // 应用亮色主题
    applyLightBtn.addEventListener('click', () => {
      if (currentScheme && window.M3Theme) {
        window.M3Theme.applyScheme(currentScheme.scheme.light);
        alert('已应用亮色主题！');
      }
    });
    
    // 应用暗色主题
    applyDarkBtn.addEventListener('click', () => {
      if (currentScheme && window.M3Theme) {
        window.M3Theme.applyScheme(currentScheme.scheme.dark);
        alert('已应用暗色主题！');
      }
    });
    
    // 复制色彩方案
    copyBtn.addEventListener('click', () => {
      if (currentScheme) {
        const schemeText = JSON.stringify(currentScheme, null, 2);
        navigator.clipboard.writeText(schemeText)
          .then(() => alert('色彩方案已复制到剪贴板！'))
          .catch(() => alert('复制失败，请手动复制控制台输出'));
        
        console.log('Material You 色彩方案:', currentScheme);
      }
    });
  }

  /**
   * 更新图片预览
   * @param {HTMLElement} container - 容器元素
   * @param {string} imageUrl - 图片URL
   */
  static updateImagePreview(container, imageUrl) {
    const preview = container.querySelector('#m3-image-preview');
    preview.innerHTML = `
      <img src="${imageUrl}" alt="图片预览" style="width: 100%; height: 100%; object-fit: cover;">
    `;
  }

  /**
   * 更新颜色调色板
   * @param {HTMLElement} container - 容器元素
   * @param {Array} colors - 颜色数组
   */
  static updateColorPalette(container, colors) {
    const palette = container.querySelector('#m3-color-palette');
    
    if (colors.length === 0) {
      palette.innerHTML = `
        <div class="m3-palette-placeholder">
          <span class="m3-placeholder-icon">❌</span>
          <p>未能提取到颜色，请尝试其他图片</p>
        </div>
      `;
      return;
    }
    
    const primaryColor = this.extractPrimaryColor(colors);
    const colorItems = colors.map(color => {
      const isPrimary = color === primaryColor;
      const textColor = M3HCTColor.getAccessibleTextColor(color);
      
      return `
        <div class="m3-color-item ${isPrimary ? 'm3-color-primary' : ''}" 
             style="background-color: ${color}; color: ${textColor};"
             title="${color}">
          <span class="m3-color-hex">${color}</span>
          ${isPrimary ? '<span class="m3-color-badge">主色调</span>' : ''}
        </div>
      `;
    }).join('');
    
    palette.innerHTML = colorItems;
  }

  /**
   * 更新色彩方案预览
   * @param {HTMLElement} container - 容器元素
   * @param {Object} scheme - 色彩方案
   */
  static updateSchemePreview(container, scheme) {
    const preview = container.querySelector('#m3-scheme-preview');
    
    if (!scheme) return;
    
    // 生成亮色方案预览
    const lightScheme = scheme.scheme.light;
    const darkScheme = scheme.scheme.dark;
    
    const lightColors = Object.entries(lightScheme).map(([key, value]) => {
      const textColor = M3HCTColor.getAccessibleTextColor(value);
      return `
        <div class="m3-scheme-color" style="background-color: ${value}; color: ${textColor};">
          <span class="m3-scheme-name">${key}</span>
          <span class="m3-scheme-value">${value}</span>
        </div>
      `;
    }).join('');
    
    const darkColors = Object.entries(darkScheme).map(([key, value]) => {
      const textColor = M3HCTColor.getAccessibleTextColor(value);
      return `
        <div class="m3-scheme-color" style="background-color: ${value}; color: ${textColor};">
          <span class="m3-scheme-name">${key}</span>
          <span class="m3-scheme-value">${value}</span>
        </div>
      `;
    }).join('');
    
    preview.innerHTML = `
      <div class="m3-scheme-section">
        <h4>亮色主题方案</h4>
        <div class="m3-scheme-grid">
          ${lightColors}
        </div>
      </div>
      
      <div class="m3-scheme-section">
        <h4>暗色主题方案</h4>
        <div class="m3-scheme-grid">
          ${darkColors}
        </div>
      </div>
      
      <div class="m3-scheme-info">
        <h4>色彩方案信息</h4>
        <div class="m3-info-grid">
          <div class="m3-info-item">
            <span class="m3-info-label">主色调:</span>
            <span class="m3-info-value" style="color: ${scheme.primary}">${scheme.primary}</span>
          </div>
          <div class="m3-info-item">
            <span class="m3-info-label">提取颜色数:</span>
            <span class="m3-info-value">${scheme.colors.length}</span>
          </div>
          <div class="m3-info-item">
            <span class="m3-info-label">调色板:</span>
            <span class="m3-info-value">${scheme.palette.length}个色调</span>
          </div>
        </div>
      </div>
    `;
  }
}