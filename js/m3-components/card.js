// Material Design 3 - 卡片组件
class M3Card extends HTMLElement {
  static get observedAttributes() {
    return ['elevated', 'outlined'];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }
  
  connectedCallback() {
    if (this.hasAttribute('elevated')) {
      this._setupElevationEffects();
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }
  
  _render() {
    const elevated = this.hasAttribute('elevated');
    const outlined = this.hasAttribute('outlined');
    
    const elevation = elevated ? 'box-shadow: var(--m3-elevation-1);' : '';
    const border = outlined ? 'border: 1px solid var(--m3-sys-outline);' : '';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: var(--m3-sys-surface);
          border-radius: var(--m3-shape-corner-card);
          padding: 16px;
          transition: all var(--m3-motion-duration-medium) var(--m3-motion-easing-standard);
          ${elevation}
          ${border}
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
          padding-top: 16px;
          border-top: 1px solid var(--m3-sys-outline-variant);
        }
        
        ::slotted([slot="actions"]) {
          display: flex;
          gap: 8px;
        }
      </style>
      
      <slot name="header"></slot>
      <slot></slot>
      <div class="m3-card-actions">
        <slot name="actions"></slot>
      </div>
    `;
  }
  
  _setupElevationEffects() {
    this.addEventListener('mouseenter', () => {
      this.style.boxShadow = 'var(--m3-elevation-2)';
    });
    
    this.addEventListener('mouseleave', () => {
      this.style.boxShadow = 'var(--m3-elevation-1)';
    });
  }
}

// 注册组件
if (!customElements.get('m3-card')) {
  customElements.define('m3-card', M3Card);
}