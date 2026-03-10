<template>
  <div class="visual-readactor">
    <header class="header">
      <h1>Visual Readactor</h1>
      <div class="actions">
        <button @click="showImageUploader = true" class="btn btn-image">
          🖼️ Из макета
        </button>
        <button @click="exportHtml" class="btn btn-primary">Экспорт HTML</button>
        <button @click="exportCss" class="btn btn-secondary">Экспорт CSS</button>
      </div>
    </header>

    <!-- Модальное окно загрузчика изображений -->
    <div v-if="showImageUploader" class="modal-overlay" @click.self="showImageUploader = false">
      <div class="modal-content">
        <ImageUploader 
          @analyzed="handleAnalyzed" 
          @close="showImageUploader = false" 
        />
      </div>
    </div>

    <div class="main-container">
      <!-- Панель редакторов -->
      <div class="editors-panel">
        <!-- Вкладка HTML -->
        <div class="editor-tab" v-if="showHtmlEditor">
          <div class="tab-header">
            <span>HTML</span>
            <button @click="showHtmlEditor = false" class="close-btn">×</button>
          </div>
          <textarea 
            v-model="htmlCode" 
            @input="updatePreview"
            placeholder="Вставьте ваш HTML код здесь..."
            class="code-editor"
          ></textarea>
        </div>

        <!-- Вкладка CSS -->
        <div class="editor-tab" v-if="showCssEditor">
          <div class="tab-header">
            <span>CSS</span>
            <button @click="showCssEditor = false" class="close-btn">×</button>
          </div>
          <textarea 
            v-model="cssCode" 
            @input="updatePreview"
            placeholder="Вставьте ваш CSS код здесь..."
            class="code-editor"
          ></textarea>
        </div>

        <!-- Кнопки открытия редакторов -->
        <div class="editor-buttons" v-if="!showHtmlEditor || !showCssEditor">
          <button @click="showHtmlEditor = true" v-if="!showHtmlEditor" class="btn btn-block">
            + HTML редактор
          </button>
          <button @click="showCssEditor = true" v-if="!showCssEditor" class="btn btn-block">
            + CSS редактор
          </button>
        </div>
      </div>

      <!-- Панель предпросмотра -->
      <div class="preview-panel">
        <div class="preview-controls">
          <label>Брейкпоинт:</label>
          <select v-model="currentBreakpoint" @change="updatePreviewSize">
            <option value="desktop">Desktop (1920px)</option>
            <option value="laptop">Laptop (1366px)</option>
            <option value="tablet">Tablet (768px)</option>
            <option value="mobile">Mobile (375px)</option>
          </select>
          <button @click="autoResize" class="btn btn-auto" title="Автоматически сгенерировать CSS для выбранного брейкпоинта">
            🚀 Автовёрстка
          </button>
        </div>
        
        <div 
          class="preview-container" 
          ref="previewContainer"
          :style="previewSizeStyle"
        >
          <iframe 
            ref="previewFrame"
            class="preview-frame"
            :srcdoc="previewContent"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Панель свойств выделенного элемента -->
    <div class="properties-panel" v-if="selectedElement">
      <div class="properties-header">
        <span>{{ selectedElementTag }}</span>
        <button @click="clearSelection" class="close-btn">×</button>
      </div>
      <div class="properties-content">
        <div class="property-group">
          <label>max-width:</label>
          <div class="property-control">
            <button @click="adjustProperty('maxWidth', -10)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.maxWidth" 
              @input="updateStyle('maxWidth', $event.target.value)"
            >
            <button @click="adjustProperty('maxWidth', 10)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>width:</label>
          <div class="property-control">
            <button @click="adjustProperty('width', -10)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.width" 
              @input="updateStyle('width', $event.target.value)"
            >
            <button @click="adjustProperty('width', 10)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>height:</label>
          <div class="property-control">
            <button @click="adjustProperty('height', -10)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.height" 
              @input="updateStyle('height', $event.target.value)"
            >
            <button @click="adjustProperty('height', 10)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>margin:</label>
          <div class="property-control">
            <button @click="adjustProperty('margin', -5)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.margin" 
              @input="updateStyle('margin', $event.target.value)"
            >
            <button @click="adjustProperty('margin', 5)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>padding:</label>
          <div class="property-control">
            <button @click="adjustProperty('padding', -5)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.padding" 
              @input="updateStyle('padding', $event.target.value)"
            >
            <button @click="adjustProperty('padding', 5)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>font-size:</label>
          <div class="property-control">
            <button @click="adjustProperty('fontSize', -1)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.fontSize" 
              @input="updateStyle('fontSize', $event.target.value)"
            >
            <button @click="adjustProperty('fontSize', 1)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>line-height:</label>
          <div class="property-control">
            <button @click="adjustProperty('lineHeight', -0.1)">-</button>
            <input 
              type="text" 
              :value="selectedStyles.lineHeight" 
              @input="updateStyle('lineHeight', $event.target.value)"
            >
            <button @click="adjustProperty('lineHeight', 0.1)">+</button>
          </div>
        </div>
        <div class="property-group">
          <label>color:</label>
          <input 
            type="color" 
            :value="selectedStyles.color || '#000000'" 
            @input="updateStyle('color', $event.target.value)"
          >
        </div>
        <div class="property-group">
          <label>background-color:</label>
          <input 
            type="color" 
            :value="selectedStyles.backgroundColor || '#ffffff'" 
            @input="updateStyle('backgroundColor', $event.target.value)"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { appendGeneratedCss } from './utils/cssGenerator.js';
import ImageUploader from './components/ImageUploader.vue';

export default {
  name: 'App',
  components: { ImageUploader },
  data() {
    return {
      htmlCode: `<div class="brands-slider">
  <div class="brand-card">
    <div class="brand-logo">
      <img src="logo-lada.png" alt="LADA">
    </div>
    <div class="brand-price">
      <span class="price-label">Стоимость:</span>
      <span class="price-value">ОТ 15 000 ₽</span>
    </div>
    <div class="brand-divider"></div>
    <div class="brand-stats">
      <span class="stats-label">Отремонтировано:</span>
      <span class="stats-value">124 АВТО</span>
    </div>
    <button class="brand-button">ЗАКАЗАТЬ</button>
  </div>
  
  <div class="brand-card">
    <div class="brand-logo">
      <img src="logo-kia.png" alt="KIA">
    </div>
    <div class="brand-price">
      <span class="price-label">Стоимость:</span>
      <span class="price-value">ОТ 15 000 ₽</span>
    </div>
    <div class="brand-divider"></div>
    <div class="brand-stats">
      <span class="stats-label">Отремонтировано:</span>
      <span class="stats-value">263 АВТО</span>
    </div>
    <button class="brand-button">ЗАКАЗАТЬ</button>
  </div>
  
  <div class="brand-card">
    <div class="brand-logo">
      <img src="logo-jeep.png" alt="Jeep">
    </div>
    <div class="brand-price">
      <span class="price-label">Стоимость:</span>
      <span class="price-value">ОТ 20 000 ₽</span>
    </div>
    <div class="brand-divider"></div>
    <div class="brand-stats">
      <span class="stats-label">Отремонтировано:</span>
      <span class="stats-value">172 АВТО</span>
    </div>
    <button class="brand-button">ЗАКАЗАТЬ</button>
  </div>
  
  <div class="brand-card">
    <div class="brand-logo">
      <img src="logo-nissan.png" alt="Nissan">
    </div>
    <div class="brand-price">
      <span class="price-label">Стоимость:</span>
      <span class="price-value">ОТ 20 000 ₽</span>
    </div>
    <div class="brand-divider"></div>
    <div class="brand-stats">
      <span class="stats-label">Отремонтировано:</span>
      <span class="stats-value">234 АВТО</span>
    </div>
    <button class="brand-button">ЗАКАЗАТЬ</button>
  </div>
  
  <div class="brand-card">
    <div class="brand-logo">
      <img src="logo-bmw.png" alt="BMW">
    </div>
    <div class="brand-price">
      <span class="price-label">Стоимость:</span>
      <span class="price-value">ОТ 20 000 ₽</span>
    </div>
    <div class="brand-divider"></div>
    <div class="brand-stats">
      <span class="stats-label">Отремонтировано:</span>
      <span class="stats-value">180 АВТО</span>
    </div>
    <button class="brand-button">ЗАКАЗАТЬ</button>
  </div>
  
  <div class="brand-card">
    <div class="brand-logo">
      <img src="logo-subaru.png" alt="Subaru">
    </div>
    <div class="brand-price">
      <span class="price-label">Стоимость:</span>
      <span class="price-value">ОТ 20 000 ₽</span>
    </div>
    <div class="brand-divider"></div>
    <div class="brand-stats">
      <span class="stats-label">Отремонтировано:</span>
      <span class="stats-value">231 АВТО</span>
    </div>
    <button class="brand-button">ЗАКАЗАТЬ</button>
  </div>
</div>`,
      cssCode: `/* Контейнер слайдера */
.brands-slider {
  display: flex;
  gap: 16px;
  padding: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Скрытие скроллбара для красоты */
.brands-slider::-webkit-scrollbar {
  height: 8px;
}

.brands-slider::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.brands-slider::-webkit-scrollbar-thumb {
  background: #d97706;
  border-radius: 4px;
}

.brands-slider::-webkit-scrollbar-thumb:hover {
  background: #b45309;
}

/* Карточка бренда */
.brand-card {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Логотип */
.brand-logo {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.brand-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Цена */
.brand-price {
  text-align: center;
  margin-bottom: 12px;
}

.price-label {
  display: block;
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;
}

.price-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
  letter-spacing: 0.5px;
}

/* Разделитель */
.brand-divider {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

/* Статистика */
.brand-stats {
  text-align: center;
  margin-bottom: 20px;
}

.stats-label {
  display: block;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

.stats-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.5px;
}

/* Кнопка */
.brand-button {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.brand-button:hover {
  background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}

.brand-button:active {
  transform: translateY(0);
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .brands-slider {
    padding: 12px;
    gap: 12px;
  }
  
  .brand-card {
    flex: 0 0 160px;
    padding: 16px 12px;
  }
  
  .brand-logo {
    height: 50px;
    margin-bottom: 12px;
  }
  
  .price-value {
    font-size: 16px;
  }
  
  .stats-value {
    font-size: 18px;
  }
  
  .brand-button {
    padding: 12px 16px;
    font-size: 12px;
  }
}

/* Адаптивность для маленьких экранов */
@media (max-width: 375px) {
  .brands-slider {
    padding: 10px;
    gap: 10px;
  }
  
  .brand-card {
    flex: 0 0 140px;
    padding: 14px 10px;
  }
  
  .brand-logo {
    height: 40px;
    margin-bottom: 10px;
  }
  
  .price-label,
  .stats-label {
    font-size: 11px;
  }
  
  .price-value {
    font-size: 14px;
  }
  
  .stats-value {
    font-size: 16px;
  }
  
  .brand-button {
    padding: 10px 12px;
    font-size: 11px;
    letter-spacing: 0.5px;
  }
}
`,
      showHtmlEditor: true,
      showCssEditor: true,
      previewContent: '',
      currentBreakpoint: 'desktop',
      previewWidth: '100%',
      selectedElement: null,
      selectedElementTag: '',
      selectedStyles: {
        maxWidth: '',
        width: '',
        height: '',
        margin: '',
        padding: '',
        fontSize: '',
        lineHeight: '',
        color: '',
        backgroundColor: ''
      },
      showImageUploader: false
    }
  },
  computed: {
    previewSizeStyle() {
      return {
        maxWidth: this.previewWidth
      }
    }
  },
  mounted() {
    this.updatePreview()
    this.setupFrameListener()
  },
  methods: {
    updatePreview() {
      const baseStyles = `
        * {
          box-sizing: border-box;
          min-width: 0;
        }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        img, video, iframe, svg, canvas {
          max-width: 100%;
          height: auto;
        }
        p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, div {
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
      `;
      
      const content = `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${baseStyles}
    ${this.cssCode}
  </style>
</head>
<body>
  ${this.htmlCode}
  <script>
    document.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;
      const styles = window.getComputedStyle(target);
      window.parent.postMessage({
        type: 'elementSelected',
        tag: target.tagName.toLowerCase(),
        class: target.className,
        styles: {
          maxWidth: styles.maxWidth,
          width: styles.width,
          height: styles.height,
          margin: styles.margin,
          padding: styles.padding,
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          color: styles.color,
          backgroundColor: styles.backgroundColor
        }
      }, '*');
    }, true);
  <\/script>
</body>
</html>`
      this.previewContent = content
    },
    updatePreviewSize() {
      const breakpoints = {
        desktop: '1920px',
        laptop: '1366px',
        tablet: '768px',
        mobile: '375px'
      }
      this.previewWidth = breakpoints[this.currentBreakpoint]
    },
    setupFrameListener() {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'elementSelected') {
          this.selectedElement = event.data
          this.selectedElementTag = `${event.data.tag}${event.data.class ? '.' + event.data.class.split(' ')[0] : ''}`
          this.selectedStyles = { ...event.data.styles }
        }
      })
    },
    clearSelection() {
      this.selectedElement = null
      this.selectedElementTag = ''
    },
    updateStyle(property, value) {
      this.selectedStyles[property] = value
      this.applyStyleToElement(property, value)
    },
    adjustProperty(property, delta) {
      let currentValue = this.selectedStyles[property]
      let numericValue = parseFloat(currentValue) || 0
      let newValue = numericValue + delta
      
      if (property === 'lineHeight') {
        newValue = parseFloat((numericValue + delta).toFixed(1))
      }
      
      let unit = 'px'
      if (property === 'lineHeight') unit = ''
      if (property === 'color' || property === 'backgroundColor') unit = ''
      
      this.selectedStyles[property] = newValue + unit
      this.applyStyleToElement(property, newValue + unit)
    },
    applyStyleToElement(property, value) {
      const frame = this.$refs.previewFrame
      if (!frame || !frame.contentWindow) return
      
      const cssProperty = this.styleToCssProperty(property)
      const script = `
        (function() {
          const selectedElement = document.querySelector('[data-selected="true"]') || document.body;
          selectedElement.style.${cssProperty} = '${value}';
        })();
      `
      frame.contentWindow.eval(script)
    },
    styleToCssProperty(property) {
      const mapping = {
        maxWidth: 'maxWidth',
        width: 'width',
        height: 'height',
        margin: 'margin',
        padding: 'padding',
        fontSize: 'fontSize',
        lineHeight: 'lineHeight',
        color: 'color',
        backgroundColor: 'backgroundColor'
      }
      return mapping[property] || property
    },
    exportHtml() {
      const blob = new Blob([this.htmlCode], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'index.html'
      a.click()
      URL.revokeObjectURL(url)
    },
    exportCss() {
      const blob = new Blob([this.cssCode], { type: 'text/css' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'styles.css'
      a.click()
      URL.revokeObjectURL(url)
    },
    autoResize() {
      // Генерируем CSS для текущего брейкпоинта
      const newCss = appendGeneratedCss(this.cssCode, this.currentBreakpoint, this.htmlCode);

      if (newCss !== this.cssCode) {
        this.cssCode = newCss;
        this.updatePreview();
      }
    },
    handleAnalyzed({ html, css }) {
      // Применяем сгенерированный код
      this.htmlCode = html;
      this.cssCode = css;
      this.updatePreview();
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #1e1e1e;
  color: #fff;
}

.visual-readactor {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.header h1 {
  font-size: 1.5rem;
  color: #61dafb;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background: #1976D2;
}

.btn-block {
  width: 100%;
  background: #404040;
  color: white;
  padding: 10px;
}

.btn-block:hover {
  background: #505050;
}

.btn-auto {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-auto:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-auto:active {
  transform: translateY(0);
}

.btn-image {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-right: 10px;
}

.btn-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  overflow: auto;
}

.modal-content {
  background: #2d2d2d;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editors-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: #252525;
  overflow-y: auto;
}

.editor-tab {
  display: flex;
  flex-direction: column;
  background: #2d2d2d;
  border-radius: 4px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #3d3d3d;
  border-bottom: 1px solid #404040;
}

.tab-header span {
  font-weight: bold;
  color: #61dafb;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.close-btn:hover {
  color: #ff6b6b;
}

.code-editor {
  width: 100%;
  height: 200px;
  padding: 10px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  resize: vertical;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.code-editor:focus {
  outline: 1px solid #61dafb;
}

.editor-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #1e1e1e;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.preview-controls label {
  font-size: 14px;
  color: #aaa;
}

.preview-controls select {
  padding: 5px 10px;
  background: #2d2d2d;
  color: #fff;
  border: 1px solid #404040;
  border-radius: 4px;
}

.preview-container {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  overflow: auto;
  margin: 0 auto;
  width: 100%;
  min-width: 0; /* Предотвращает растягивание контейнера */
  transition: max-width 0.3s;
  /* Гарантируем что контент не выходит за рамки */
  display: flex;
  flex-direction: column;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  min-height: 500px;
  /* Важно: предотвращаем минимальную ширину по содержимому */
  min-width: 0;
  flex-shrink: 1;
}

.properties-panel {
  position: fixed;
  top: 70px;
  right: 20px;
  width: 280px;
  background: #2d2d2d;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  max-height: calc(100vh - 90px);
  overflow-y: auto;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #3d3d3d;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #404040;
}

.properties-header span {
  font-weight: bold;
  color: #61dafb;
}

.properties-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.property-group label {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
}

.property-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.property-control button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  background: #404040;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
}

.property-control button:hover {
  background: #505050;
}

.property-control input[type="text"] {
  flex: 1;
  height: 30px;
  padding: 0 8px;
  background: #1e1e1e;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #fff;
  text-align: center;
}

.property-control input[type="color"] {
  width: 100%;
  height: 35px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.property-group input[type="color"] {
  width: 100%;
  height: 35px;
  border: 1px solid #404040;
  border-radius: 4px;
  cursor: pointer;
  background: #1e1e1e;
}
</style>
