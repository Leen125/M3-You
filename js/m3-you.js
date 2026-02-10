// Material Design 3 UI 组件库 - Web Components 实现
(function() {
  'use strict';
  
  // 涟漪效果工具函数
  function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('m3-ripple');
    
    const ripple = button.getElementsByClassName('m3-ripple')[0];
    if (ripple) ripple.remove();
    
    button.appendChild(circle);
    
    setTimeout(() => circle.remove(), 600);
  }
  
  // === 按钮组件 ===
  class M3Button extends HTMLElement {
    static get observedAttributes() {
      return ['variant', 'elevated', 'disabled', 'icon'];
    }
    
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._render();
    }
    
    connectedCallback() {
      this.addEventListener('click', createRipple);
      this.addEventListener('keydown', this._handleKeyDown.bind(this));
      this._updateA11y();
    }
    
    disconnectedCallback() {
      this.removeEventListener('click', createRipple);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this._render();
        this._updateA11y();
      }
    }
    
    _render() {
      const variant = this.getAttribute('variant') || 'filled';
      const elevated = this.hasAttribute('elevated');
      const disabled = this.hasAttribute('disabled');
      const icon = this.getAttribute('icon');
      
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
      const elevation = elevated ? 'box-shadow: var(--m3-elevation-1);' : '';
      const disabledStyle = disabled ? 'opacity: 0.38; pointer-events: none;' : '';
      
      const iconHTML = icon ? `<span class="m3-button-icon">${icon}</span>` : '';
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 40px;
            min-width: 64px;
            padding: 0 24px;
            border-radius: var(--m3-shape-corner-full);
            font: var(--m3-typescale-label-large);
            font-weight: 500;
            cursor: pointer;
            user-select: none;
            position: relative;
            overflow: hidden;
            transition: all var(--m3-motion-duration-short) var(--m3-motion-easing-standard);
            ${style}
            ${elevation}
            ${disabledStyle}
          }
          
          :host(:hover)::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: currentColor;
            opacity: 0.08;
          }
          
          :host(:active)::before {
            opacity: 0.12;
          }
          
          :host(:focus-visible) {
            outline: 2px solid var(--m3-sys-primary);
            outline-offset: 2px;
          }
          
          .m3-button-icon {
            margin-right: 8px;
            font-size: 18px;
            line-height: 1;
          }
          
          .m3-ripple {
            position: absolute;
            border-radius: 50%;
            background-color: currentColor;
            opacity: 0.2;
            animation: ripple 600ms linear;
            transform: scale(0);
          }
          
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        </style>
        ${iconHTML}
        <slot></slot>
      `;
    }
    
    _handleKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.click();
      }
    }
    
    _updateA11y() {
      const disabled = this.hasAttribute('disabled');
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', disabled ? '-1' : '0');
      if (disabled) {
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
  }
  
  // === 卡片组件 ===
  class M3Card extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._render();
    }
    
    connectedCallback() {
      const elevated = this.hasAttribute('elevated');
      if (elevated) {
        this._updateElevation();
      }
    }
    
    _render() {
      const elevated = this.hasAttribute('elevated');
      const elevation = elevated ? 'var(--m3-elevation-1)' : 'none';
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            background-color: var(--m3-sys-surface);
            border-radius: var(--m3-shape-corner-large);
            padding: 16px;
            transition: all var(--m3-motion-duration-medium) var(--m3-motion-easing-standard);
            box-shadow: ${elevation};
          }
          
          ::slotted(h1),
          ::slotted(h2),
          ::slotted(h3) {
            margin-top: 0;
            margin-bottom: 8px;
            font: var(--m3-typescale-title-large);
            color: var(--m3-sys-on-surface);
          }
          
          ::slotted(p) {
            margin-top: 0;
            margin-bottom: 16px;
            font: var(--m3-typescale-body-medium);
            color: var(--m3-sys-on-surface-variant);
          }
          
          .m3-card-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
          }
        </style>
        <slot name="header"></slot>
        <slot></slot>
        <div class="m3-card-actions">
          <slot name="actions"></slot>
        </div>
      `;
    }
    
    _updateElevation() {
      const card = this.shadowRoot.host;
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = 'var(--m3-elevation-2)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = 'var(--m3-elevation-1)';
      });
    }
  }
  
  // === 开关组件 ===
  class M3Switch extends HTMLElement {
    static get observedAttributes() {
      return ['checked', 'disabled'];
    }
    
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._render();
      this._checked = this.hasAttribute('checked');
    }
    
    connectedCallback() {
      this.addEventListener('click', this._toggle.bind(this));
      this.addEventListener('keydown', this._handleKeyDown.bind(this));
      this._updateA11y();
    }
    
    _render() {
      const checked = this._checked;
      const disabled = this.hasAttribute('disabled');
      const disabledStyle = disabled ? 'opacity: 0.38; pointer-events: none;' : '';
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;
            user-select: none;
            ${disabledStyle}
          }
          
          .m3-switch-track {
            position: relative;
            width: 52px;
            height: 32px;
            border-radius: var(--m3-shape-corner-full);
            background-color: var(--m3-sys-surface-variant);
            transition: all var(--m3-motion-duration-short) var(--m3-motion-easing-standard);
          }
          
          .m3-switch-thumb {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 28px;
            height: 28px;
            border-radius: var(--m3-shape-corner-full);
            background-color: var(--m3-sys-outline);
            transition: all var(--m3-motion-duration-short) var(--m3-motion-easing-standard);
            box-shadow: var(--m3-elevation-1);
          }
          
          :host([checked]) .m3-switch-track {
            background-color: var(--m3-sys-primary);
          }
          
          :host([checked]) .m3-switch-thumb {
            background-color: var(--m3-sys-on-primary);
            left: 22px;
          }
          
          .m3-switch-label {
            font: var(--m3-typescale-body-large);
            color: var(--m3-sys-on-surface);
          }
          
          :host(:focus-visible) .m3-switch-thumb {
            outline: 2px solid var(--m3-sys-primary);
            outline-offset: 2px;
          }
        </style>
        <div class="m3-switch-track">
          <div class="m3-switch-thumb"></div>
        </div>
        <span class="m3-switch-label">
          <slot></slot>
        </span>
      `;
    }
    
    _toggle() {
      if (this.hasAttribute('disabled')) return;
      
      this._checked = !this._checked;
      
      if (this._checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      
      // 触发自定义事件
      this.dispatchEvent(new CustomEvent('change', {
        detail: { checked: this._checked },
        bubbles: true
      }));
      
      this._render();
    }
    
    _handleKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._toggle();
      }
    }
    
    _updateA11y() {
      this.setAttribute('role', 'switch');
      this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
      this.setAttribute('aria-checked', this._checked.toString());
      if (this.hasAttribute('disabled')) {
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'checked') {
        this._checked = newValue !== null;
        this._updateA11y();
      }
    }
  }
  
  // === 注册所有组件 ===
  customElements.define('m3-button', M3Button);
  customElements.define('m3-card', M3Card);
  customElements.define('m3-switch', M3Switch);
  
  // 导出一个简单的API用于主题控制
  window.M3 = {
    // 设置主题
    setTheme: function(seedColor, isDark) {
      if (window.M3Theme) {
        window.M3Theme.applyTheme(seedColor, isDark);
      }
    },
    
    // 切换暗色/亮色模式
    toggleTheme: function() {
      const root = document.documentElement;
      const isDark = root.dataset.theme === 'dark';
      const currentSeed = getComputedStyle(root).getPropertyValue('--m3-ref-primary-40').trim();
      window.M3Theme.applyTheme(currentSeed, !isDark);
    },
    
    // 获取当前主题信息
    getTheme: function() {
      const root = document.documentElement;
      return {
        seed: getComputedStyle(root).getPropertyValue('--m3-ref-primary-40').trim(),
        isDark: root.dataset.theme === 'dark'
      };
    },
    
    // 组件注册状态
    components: {
      Button: M3Button,
      Card: M3Card,
      Switch: M3Switch
    }
  };
  
  console.log('Material Design 3 UI Library loaded successfully');
  console.log('Available components: <m3-button>, <m3-card>, <m3-switch>');
  console.log('Theme control: window.M3.setTheme(), window.M3.toggleTheme()');
})();