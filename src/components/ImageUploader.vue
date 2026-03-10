<template>
  <div class="image-uploader">
    <h2 class="uploader-title">🖼️ Вёрстка по макету</h2>
    <p class="uploader-subtitle">Загрузите PNG/JPG изображение из Figma для автоматической генерации кода</p>

    <!-- Зона загрузки -->
    <div 
      class="upload-zone" 
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <div v-if="!imageFile" class="upload-placeholder">
        <span class="upload-icon">📁</span>
        <p class="upload-text">Перетащите изображение сюда</p>
        <p class="upload-hint">или кликните для выбора файла</p>
        <p class="upload-formats">PNG, JPG до 10MB</p>
      </div>
      
      <div v-else class="upload-preview">
        <img :src="imagePreview" alt="Preview" class="preview-image">
        <button @click.stop="resetImage" class="remove-image-btn" title="Удалить">×</button>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="upload-actions" v-if="imageFile">
      <button 
        @click="startAnalysis" 
        :disabled="isAnalyzing"
        class="btn-analyze"
      >
        {{ isAnalyzing ? '⏳ Анализ...' : '🚀 Анализировать макет' }}
      </button>
      <button @click="resetAll" class="btn-reset">Сбросить</button>
    </div>

    <!-- Прогресс анализа -->
    <div v-if="isAnalyzing" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: analysisProgress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progressText }}</p>
    </div>

    <!-- Результаты анализа -->
    <div v-if="analysisResult" class="analysis-result">
      <h3 class="result-title">📊 Результаты анализа</h3>
      
      <div class="result-tabs">
        <button 
          :class="{ active: activeTab === 'structure' }" 
          @click="activeTab = 'structure'"
          class="tab-btn"
        >
          Структура
        </button>
        <button 
          :class="{ active: activeTab === 'colors' }" 
          @click="activeTab = 'colors'"
          class="tab-btn"
        >
          Цвета
        </button>
        <button 
          :class="{ active: activeTab === 'text' }" 
          @click="activeTab = 'text'"
          class="tab-btn"
        >
          Текст
        </button>
      </div>

      <div class="result-content">
        <!-- Структура -->
        <div v-if="activeTab === 'structure'" class="tab-content">
          <div class="structure-info">
            <p><strong>Размер макета:</strong> {{ analysisResult.layout.width }} × {{ analysisResult.layout.height }}px</p>
            <p><strong>Найдено областей:</strong> {{ analysisResult.layout.regions.length }}</p>
          </div>
          <div class="regions-list">
            <div 
              v-for="region in analysisResult.layout.regions.slice(0, 10)" 
              :key="region.id"
              class="region-item"
            >
              <span class="region-size">{{ region.width }}×{{ region.height }}</span>
              <span class="region-pos">({{ region.x }}, {{ region.y }})</span>
            </div>
          </div>
        </div>

        <!-- Цвета -->
        <div v-if="activeTab === 'colors'" class="tab-content">
          <div class="colors-grid">
            <div 
              v-for="(color, index) in analysisResult.colors.palette" 
              :key="index"
              class="color-item"
            >
              <div class="color-swatch" :style="{ backgroundColor: color }"></div>
              <span class="color-value">{{ color }}</span>
              <span v-if="index === 0" class="color-badge">Основной</span>
            </div>
          </div>
        </div>

        <!-- Текст -->
        <div v-if="activeTab === 'text'" class="tab-content">
          <div class="text-info">
            <p><strong>Распознано строк:</strong> {{ analysisResult.text.lines?.length || 0 }}</p>
          </div>
          <div class="text-list">
            <div 
              v-for="(line, index) in (analysisResult.text.lines || []).slice(0, 20)" 
              :key="index"
              class="text-line"
            >
              <span class="line-text">{{ line.text }}</span>
              <span class="line-conf" :class="getConfidenceClass(line.words[0]?.confidence)">
                {{ Math.round(line.words[0]?.confidence) || 0 }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопки применения -->
    <div class="modal-actions" v-if="analysisResult && generatedCode">
      <button @click="applyCode" class="btn-apply">
        ✅ Применить код в редактор
      </button>
      <button @click="$emit('close')" class="btn-cancel">
        Отмена
      </button>
    </div>

    <!-- Предпросмотр кода -->
    <div v-if="generatedCode" class="code-preview">
      <h4 class="code-title">📝 Сгенерированный код</h4>
      <div class="code-tabs">
        <button 
          :class="{ active: codeTab === 'html' }" 
          @click="codeTab = 'html'"
          class="code-tab-btn"
        >
          HTML
        </button>
        <button 
          :class="{ active: codeTab === 'css' }" 
          @click="codeTab = 'css'"
          class="code-tab-btn"
        >
          CSS
        </button>
      </div>
      <pre class="code-block">{{ codeTab === 'html' ? generatedCode.html : generatedCode.css }}</pre>
    </div>
  </div>
</template>

<script>
import { detectText, detectColors, detectLayout } from '../utils/imageAnalyzer.js';
import { generateHTML, generateCSS, optimizeCode } from '../utils/codeGenerator.js';

export default {
  name: 'ImageUploader',
  emits: ['analyzed', 'close'],
  data() {
    return {
      imageFile: null,
      imagePreview: null,
      isDragOver: false,
      isAnalyzing: false,
      analysisProgress: 0,
      progressText: '',
      analysisResult: null,
      generatedCode: null,
      activeTab: 'structure',
      codeTab: 'html'
    };
  },
  methods: {
    triggerFileInput() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) this.setFile(file);
      };
      input.click();
    },

    handleDrop(e) {
      this.isDragOver = false;
      const file = e.dataTransfer.files[0];
      if (file && file.type.match('image.*')) {
        this.setFile(file);
      }
    },

    setFile(file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 10MB');
        return;
      }
      this.imageFile = file;
      this.imagePreview = URL.createObjectURL(file);
      this.analysisResult = null;
      this.generatedCode = null;
    },

    resetImage() {
      this.imageFile = null;
      this.imagePreview = null;
      this.analysisResult = null;
      this.generatedCode = null;
    },

    resetAll() {
      this.resetImage();
      this.analysisProgress = 0;
      this.progressText = '';
    },

    async startAnalysis() {
      if (!this.imageFile) return;

      this.isAnalyzing = true;
      this.analysisProgress = 0;
      this.analysisResult = null;

      try {
        // Шаг 1: Анализ структуры
        this.progressText = '📐 Анализ структуры макета...';
        this.analysisProgress = 20;
        const layout = await detectLayout(this.imageFile);

        // Шаг 2: Распознавание текста
        this.progressText = '📝 Распознавание текста (OCR)...';
        this.analysisProgress = 50;
        const text = await detectText(this.imageFile);

        // Шаг 3: Извлечение цветов
        this.progressText = '🎨 Извлечение цветовой палитры...';
        this.analysisProgress = 75;
        const colors = await detectColors(this.imageFile);

        // Шаг 4: Генерация кода
        this.progressText = '⚙️ Генерация HTML/CSS...';
        this.analysisProgress = 90;
        
        const html = generateHTML({ ...layout, regions: layout.regions }, text.lines);
        const css = generateCSS(layout, colors, text.lines);
        const optimized = optimizeCode(html, css);

        this.analysisProgress = 100;

        // Сохраняем результаты
        this.analysisResult = { layout, text, colors };
        this.generatedCode = {
          html: optimized.html,
          css: optimized.css
        };

        // Эмитим результат
        this.$emit('analyzed', {
          html: optimized.html,
          css: optimized.css,
          structure: this.analysisResult
        });

      } catch (error) {
        console.error('Analysis error:', error);
        alert('Ошибка при анализе изображения: ' + error.message);
      } finally {
        this.isAnalyzing = false;
      }
    },

    applyCode() {
      if (this.generatedCode) {
        this.$emit('analyzed', {
          html: this.generatedCode.html,
          css: this.generatedCode.css,
          structure: this.analysisResult
        });
        this.$emit('close');
      }
    },

    getConfidenceClass(confidence) {
      if (!confidence) return 'low';
      if (confidence > 80) return 'high';
      if (confidence > 50) return 'medium';
      return 'low';
    }
  },
  beforeUnmount() {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }
};
</script>

<style scoped>
.image-uploader {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.uploader-title {
  font-size: 24px;
  margin-bottom: 8px;
  color: #61dafb;
}

.uploader-subtitle {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 20px;
}

.upload-zone {
  border: 2px dashed #404040;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #252525;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone.drag-over {
  border-color: #61dafb;
  background: #2a3a3a;
}

.upload-placeholder {
  color: #888;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.upload-text {
  font-size: 18px;
  margin-bottom: 8px;
  color: #fff;
}

.upload-hint {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.upload-formats {
  font-size: 12px;
  color: #555;
}

.upload-preview {
  position: relative;
  max-width: 100%;
  max-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.remove-image-btn:hover {
  background: rgba(255, 0, 0, 0.7);
}

.upload-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-analyze {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-analyze:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-analyze:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reset {
  padding: 12px 24px;
  background: #404040;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-reset:hover {
  background: #505050;
}

.progress-container {
  margin-top: 20px;
}

.progress-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  color: #aaa;
  text-align: center;
}

.analysis-result {
  margin-top: 30px;
  background: #252525;
  border-radius: 8px;
  padding: 20px;
}

.result-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #61dafb;
}

.result-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #404040;
  padding-bottom: 10px;
}

.tab-btn {
  padding: 8px 16px;
  background: transparent;
  color: #aaa;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #404040;
  color: #fff;
}

.tab-btn:hover:not(.active) {
  background: #333;
}

.tab-content {
  min-height: 150px;
}

.structure-info,
.text-info {
  margin-bottom: 15px;
  color: #aaa;
}

.regions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.region-item {
  background: #333;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.region-size {
  color: #61dafb;
  font-weight: 600;
}

.region-pos {
  color: #888;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid #404040;
}

.color-value {
  font-size: 12px;
  color: #aaa;
  font-family: monospace;
}

.color-badge {
  font-size: 10px;
  background: #667eea;
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
}

.text-list {
  max-height: 200px;
  overflow-y: auto;
}

.text-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #333;
  border-radius: 4px;
  margin-bottom: 8px;
}

.line-text {
  flex: 1;
  color: #fff;
  font-size: 14px;
}

.line-conf {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.line-conf.high {
  background: #4CAF50;
  color: #fff;
}

.line-conf.medium {
  background: #FF9800;
  color: #fff;
}

.line-conf.low {
  background: #f44336;
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-apply {
  flex: 1;
  padding: 12px 24px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-apply:hover {
  background: #45a049;
}

.btn-cancel {
  padding: 12px 24px;
  background: #404040;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #505050;
}

.code-preview {
  margin-top: 20px;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
}

.code-title {
  font-size: 16px;
  margin-bottom: 10px;
  color: #61dafb;
}

.code-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.code-tab-btn {
  padding: 6px 12px;
  background: #333;
  color: #aaa;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.code-tab-btn.active {
  background: #61dafb;
  color: #1e1e1e;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
