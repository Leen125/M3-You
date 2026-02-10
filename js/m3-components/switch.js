// Material Design 3 - 开关组件
class M3Switch extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled'];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._checked = this.hasAttribute('checked');
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
      if (name === 'checked') {
        this._checked = newValue !== null;
      }
      this._render();
      this._updateAccessibility();
    }
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
          transition: all var(--m3-motion-duration-medium) var(--m3-motion-easing-standard);
        }
        
        .m3-switch-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 28px;
          height: 28px;
          border-radius: var(--m3-shape-corner-full);
          background-color: var(--m3-sys-outline);
          transition: all var(--m3-motion-duration-medium) var(--m3-motion-easing-standard);
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
        
        :host(:hover) .m3-switch-track::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: currentColor;
          opacity: var(--m3-state-hover);
          border-radius: inherit;
          pointer-events: none;
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
  
  _setupEventListeners() {
    this._clickHandler = this._toggle.bind(this);
    this._keydownHandler = this._handleKeyDown.bind(this);
    
    this.addEventListener('click', this._clickHandler);
    this.addEventListener('keydown', this._keydownHandler);
  }
  
  _cleanupEventListeners() {
    this.removeEventListener('click', this._clickHandler);
    this.removeEventListener('keydown', this._keydownHandler);
  }
  
  _toggle() {
    if (this.hasAttribute('disabled')) return;
    
    this._checked = !this._checked;
    
    if (this._checked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    
    this.dispatchEvent(new CustomEvent('change', {
      detail: { checked: this._checked },
      bubbles: true
    }));
  }
  
  _handleKeyDown(event) {
    if (this.hasAttribute('disabled')) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._toggle();
    }
  }
  
  _updateAccessibility() {
    this.setAttribute('role', 'switch');
    this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    this.setAttribute('aria-checked', this._checked.toString());
    
    if (this.hasAttribute('disabled')) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
  }
  
  // 公共方法
  toggle() {
    this._toggle();
  }
  
  setChecked(checked) {
    this._checked = checked;
    if (checked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    this._updateAccessibility();
  }
  
  setDisabled(disabled) {
    if (disabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
  
  get checked() {
    return this._checked;
  }
}

// 注册组件
if (!customElements.get('m3-switch')) {
  customElements.define('m3-switch', M3Switch);
}