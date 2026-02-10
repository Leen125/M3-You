/**
 * Material Design 3 - 按钮组件
 */
class M3Button extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'elevated', 'disabled', 'icon', 'loading', 'fullwidth'];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }
  
  connectedCallback() {
    this._setupEventListeners();
    this._updateAccessibility();
  }
  
  disconnectedCallback() {
    this._cleanupEventListeners();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
      this._updateAccessibility();
    }
  }
  
  _render() {
    const variant = this.getAttribute('variant') || 'filled';
    const elevated = this.hasAttribute('elevated');
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    const fullwidth = this.hasAttribute('fullwidth');
    const icon = this.getAttribute('icon');
    
    // 变体样式映射
    const variantStyles = {
      'filled': `
        background-color: var(--m3-sys-primary);
        color: var(--m3-sys-on-primary);
        border: none;
      `,
      'tonal': `
        background-color: var(--m3-sys-secondary-container);
        color: var(--m3-sys-on-secondary-container);
        border: none;
      `,
      'outlined': `
        background-color: transparent;
        color: var(--m3-sys-primary);
        border: 1px solid var(--m3-sys-outline);
      `,
      'text': `
        background-color: transparent;
        color: var(--m3-sys-primary);
        border: none;
      `,
      'elevated': `
        background-color: var(--m3-sys-surface);
        color: var(--m3-sys-primary);
        border: none;
        box-shadow: var(--m3-elevation-1);
      `
    };
    
    const style = variantStyles[variant] || variantStyles['filled'];
    const elevation = elevated && variant !== 'elevated' ? 'box-shadow: var(--m3-elevation-1);' : '';
    const disabledStyle = disabled ? 'opacity: var(--m3-state-disabled); pointer-events: none;' : '';
    const loadingStyle = loading ? 'pointer-events: none;' : '';
    const widthStyle = fullwidth ? 'width: 100%;' : '';
    
    const iconHTML = icon ? `<span class="m3-button-icon">${icon}</span>` : '';
    const loadingHTML = loading ? '<span class="m3-button-loading"></span>' : '';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          ${style}
          ${elevation}
          ${disabledStyle}
          ${loadingStyle}
          ${widthStyle}
          
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: var(--m3-size-button-height-medium);
          min-width: 64px;
          padding: 0 24px;
          border-radius: var(--m3-shape-corner-button);
          font: var(--m3-typescale-label-large);
          font-weight: 500;
          cursor: pointer;
          user-select: none;
          position: relative;
          overflow: hidden;
          transition: all var(--m3-motion-duration-medium-2) var(--m3-motion-easing-standard);
        }
        
        :host([size="small"]) {
          min-height: var(--m3-size-button-height-small);
          padding: 0 12px;
          font: var(--m3-typescale-label-medium);
        }
        
        :host([size="large"]) {
          min-height: 48px;
          padding: 0 32px;
          font: var(--m3-typescale-label-large);
          font-size: 16px;
        }
        
        :host(:hover)::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: currentColor;
          opacity: var(--m3-state-hover);
          pointer-events: none;
          border-radius: inherit;
        }
        
        :host(:active)::before {
          opacity: var(--m3-state-pressed);
        }
        
        :host(:focus-visible) {
          outline: 2px solid var(--m3-sys-primary);
          outline-offset: 2px;
        }
        
        .m3-button-icon {
          margin-right: 8px;
          font-size: 18px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
        }
        
        .m3-button-loading {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: m3-button-spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes m3-button-spin {
          to { transform: rotate(360deg); }
        }
        
        slot {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      </style>
      
      ${loadingHTML}
      ${iconHTML}
      <slot></slot>
    `;
  }
  
  _setupEventListeners() {
    this.addEventListener('click', this._handleClick.bind(this));
    this.addEventListener('keydown', this._handleKeyDown.bind(this));
    this.addEventListener('mousedown', this._handleMouseDown.bind(this));
  }
  
  _cleanupEventListeners() {
    this.removeEventListener('click', this._handleClick);
    this.removeEventListener('keydown', this._handleKeyDown);
    this.removeEventListener('mousedown', this._handleMouseDown);
  }
  
  _handleClick(event) {
    if (this.hasAttribute('disabled')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    // 创建涟漪效果
    if (window.M3 && !this.hasAttribute('loading')) {
      window.M3.createRipple(event, this);
    }
    
    // 触发自定义事件
    this.dispatchEvent(new CustomEvent('m3-button-click', {
      detail: { 
        variant: this.getAttribute('variant'),
        timestamp: new Date().toISOString()
      },
      bubbles: true,
      composed: true
    }));
  }
  
  _handleKeyDown(event) {
    if (this.hasAttribute('disabled')) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.click();
    }
  }
  
  _handleMouseDown(event) {
    if (this.hasAttribute('disabled')) return;
    
    // 添加按压状态
    this.classList.add('m3-button-pressed');
    setTimeout(() => {
      this.classList.remove('m3-button-pressed');
    }, 200);
  }
  
  _updateAccessibility() {
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', disabled ? '-1' : '0');
    
    if (disabled) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
    
    if (loading) {
      this.setAttribute('aria-busy', 'true');
    } else {
      this.removeAttribute('aria-busy');
    }
    
    // 确保有可访问的标签
    if (!this.hasAttribute('aria-label') && !this.textContent.trim()) {
      const slot = this.shadowRoot.querySelector('slot');
      const assignedNodes = slot.assignedNodes();
      const textContent = assignedNodes.map(node => node.textContent).join('').trim();
      
      if (!textContent) {
        console.warn('M3Button: Button should have visible text or an aria-label');
      }
    }
  }
  
  // 公共API
  setLoading(loading) {
    if (loading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }
  
  setDisabled(disabled) {
    if (disabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
  
  // 响应主题变化
  onThemeChange(themeInfo) {
    // 重新渲染以应用新的颜色变量
    this._render();
  }
}

// 注册组件
if (window.M3) {
  window.M3.registerComponent('m3-button', M3Button);
} else {
  customElements.define('m3-button', M3Button);
}