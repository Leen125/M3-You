/**
 * Material Design 3 - HCT色彩空间算法
 * 基于Google的Material Color Utilities
 */
class M3HCTColor {
  constructor(hue, chroma, tone) {
    this.hue = hue;
    this.chroma = chroma;
    this.tone = tone;
  }

  /**
   * 从十六进制颜色创建HCT
   * @param {string} hex - 十六进制颜色 (#RRGGBB)
   * @returns {M3HCTColor}
   */
  static fromHex(hex) {
    const rgb = this.hexToRgb(hex);
    const [h, c, t] = this.rgbToHct(rgb.r, rgb.g, rgb.b);
    return new M3HCTColor(h, c, t);
  }

  /**
   * 从RGB创建HCT
   * @param {number} r - 红色 (0-255)
   * @param {number} g - 绿色 (0-255)
   * @param {number} b - 蓝色 (0-255)
   * @returns {M3HCTColor}
   */
  static fromRgb(r, g, b) {
    const [h, c, t] = this.rgbToHct(r, g, b);
    return new M3HCTColor(h, c, t);
  }

  /**
   * RGB转HCT（简化算法）
   * @param {number} r - 红色 (0-255)
   * @param {number} g - 绿色 (0-255)
   * @param {number} b - 蓝色 (0-255)
   * @returns {Array} [hue, chroma, tone]
   */
  static rgbToHct(r, g, b) {
    // 归一化
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    // RGB转XYZ
    const x = 0.4124564 * rNorm + 0.3575761 * gNorm + 0.1804375 * bNorm;
    const y = 0.2126729 * rNorm + 0.7151522 * gNorm + 0.0721750 * bNorm;
    const z = 0.0193339 * rNorm + 0.1191920 * gNorm + 0.9503041 * bNorm;
    
    // XYZ转Lab
    const xRef = 0.95047;
    const yRef = 1.00000;
    const zRef = 1.08883;
    
    const xRatio = x / xRef;
    const yRatio = y / yRef;
    const zRatio = z / zRef;
    
    const epsilon = 0.008856;
    const kappa = 903.3;
    
    const fx = xRatio > epsilon ? Math.cbrt(xRatio) : (kappa * xRatio + 16) / 116;
    const fy = yRatio > epsilon ? Math.cbrt(yRatio) : (kappa * yRatio + 16) / 116;
    const fz = zRatio > epsilon ? Math.cbrt(zRatio) : (kappa * zRatio + 16) / 116;
    
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bLab = 200 * (fy - fz);
    
    // Lab转LCh（简化版）
    const C = Math.sqrt(a * a + bLab * bLab);
    const hRad = Math.atan2(bLab, a);
    let H = (hRad * 180) / Math.PI;
    if (H < 0) H += 360;
    
    // 色调映射到0-360
    const hue = H;
    const chroma = C * 0.8; // 简化缩放
    const tone = L;
    
    return [hue, chroma, tone];
  }

  /**
   * HCT转RGB
   * @returns {Object} {r, g, b}
   */
  toRgb() {
    // 简化的HCT转RGB算法
    const hRad = (this.hue * Math.PI) / 180;
    const a = this.chroma * Math.cos(hRad) / 0.8;
    const b = this.chroma * Math.sin(hRad) / 0.8;
    const L = this.tone;
    
    // Lab转XYZ
    const fy = (L + 16) / 116;
    const fx = fy + a / 500;
    const fz = fy - b / 200;
    
    const xRef = 0.95047;
    const yRef = 1.00000;
    const zRef = 1.08883;
    
    const x = (fx ** 3 > 0.008856 ? fx ** 3 : (116 * fx - 16) / 903.3) * xRef;
    const y = (fy ** 3 > 0.008856 ? fy ** 3 : (116 * fy - 16) / 903.3) * yRef;
    const z = (fz ** 3 > 0.008856 ? fz ** 3 : (116 * fz - 16) / 903.3) * zRef;
    
    // XYZ转RGB
    let r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
    let g = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
    let bResult = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
    
    // 伽马校正
    r = r > 0.0031308 ? 1.055 * (r ** (1 / 2.4)) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * (g ** (1 / 2.4)) - 0.055 : 12.92 * g;
    bResult = bResult > 0.0031308 ? 1.055 * (bResult ** (1 / 2.4)) - 0.055 : 12.92 * bResult;
    
    // 裁剪到[0,1]范围
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bResult = Math.max(0, Math.min(1, bResult));
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(bResult * 255)
    };
  }

  /**
   * HCT转十六进制
   * @returns {string} 十六进制颜色
   */
  toHex() {
    const rgb = this.toRgb();
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  /**
   * 获取色调调色板
   * @param {number} tones - 色调数量
   * @returns {Array} 色调数组
   */
  getHuePalette(tones = 12) {
    const palette = [];
    const step = 360 / tones;
    
    for (let i = 0; i < tones; i++) {
      const hue = (this.hue + i * step) % 360;
      const color = new M3HCTColor(hue, this.chroma, this.tone);
      palette.push(color.toHex());
    }
    
    return palette;
  }

  /**
   * 获取动态色彩调色板（Material You风格）
   * @param {number} seedColor - 种子颜色
   * @returns {Object} 包含各种色彩角色的调色板
   */
  static generateDynamicPalette(seedColor) {
    const seedHct = M3HCTColor.fromHex(seedColor);
    
    return {
      primary: seedHct.toHex(),
      secondary: this.adjustHue(seedHct, 60).toHex(),
      tertiary: this.adjustHue(seedHct, 120).toHex(),
      neutral: this.adjustChroma(seedHct, -30).toHex(),
      neutralVariant: this.adjustChroma(seedHct, -15).toHex(),
      error: '#BA1A1A', // 错误色固定
      
      // 生成13色调色板
      palette: this.generateTonalPalette(seedHct)
    };
  }

  /**
   * 调整色调
   * @param {M3HCTColor} color - 原始颜色
   * @param {number} delta - 色调变化量
   * @returns {M3HCTColor}
   */
  static adjustHue(color, delta) {
    return new M3HCTColor(
      (color.hue + delta) % 360,
      color.chroma,
      color.tone
    );
  }

  /**
   * 调整色度
   * @param {M3HCTColor} color - 原始颜色
   * @param {number} delta - 色度变化量
   * @returns {M3HCTColor}
   */
  static adjustChroma(color, delta) {
    return new M3HCTColor(
      color.hue,
      Math.max(0, color.chroma + delta),
      color.tone
    );
  }

  /**
   * 调整明度
   * @param {M3HCTColor} color - 原始颜色
   * @param {number} delta - 明度变化量
   * @returns {M3HCTColor}
   */
  static adjustTone(color, delta) {
    return new M3HCTColor(
      color.hue,
      color.chroma,
      Math.max(0, Math.min(100, color.tone + delta))
    );
  }

  /**
   * 生成色调调色板
   * @param {M3HCTColor} color - 基础颜色
   * @returns {Array} 13个色调的调色板
   */
  static generateTonalPalette(color) {
    const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
    return tones.map(tone => {
      const newColor = new M3HCTColor(color.hue, color.chroma, tone);
      return newColor.toHex();
    });
  }

  /**
   * RGB转十六进制
   * @param {number} r - 红色
   * @param {number} g - 绿色
   * @param {number} b - 蓝色
   * @returns {string} 十六进制颜色
   */
  static rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase();
  }

  /**
   * 十六进制转RGB
   * @param {string} hex - 十六进制颜色
   * @returns {Object} RGB对象
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * 计算颜色对比度
   * @param {string} color1 - 颜色1
   * @param {string} color2 - 颜色2
   * @returns {number} 对比度比率
   */
  static contrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const luminance1 = this.relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = this.relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 计算相对亮度
   * @param {number} r - 红色
   * @param {number} g - 绿色
   * @param {number} b - 蓝色
   * @returns {number} 相对亮度
   */
  static relativeLuminance(r, g, b) {
    const rsrgb = r / 255;
    const gsrgb = g / 255;
    const bsrgb = b / 255;
    
    const rLinear = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
    const gLinear = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
    const bLinear = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * 获取可访问性对比色
   * @param {string} backgroundColor - 背景色
   * @returns {string} 对比度足够的文字颜色
   */
  static getAccessibleTextColor(backgroundColor) {
    const rgb = this.hexToRgb(backgroundColor);
    const luminance = this.relativeLuminance(rgb.r, rgb.g, rgb.b);
    
    // WCAG AA标准：4.5:1对比度
    const blackContrast = this.contrastRatio(backgroundColor, '#000000');
    const whiteContrast = this.contrastRatio(backgroundColor, '#FFFFFF');
    
    if (blackContrast >= 4.5) {
      return '#000000';
    } else if (whiteContrast >= 4.5) {
      return '#FFFFFF';
    } else {
      // 自动调整亮度
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
  }
}