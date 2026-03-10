# План разработки: Вёрстка по макету из картинки (Image to Code)

## 🎯 Цель
Реализовать функционал загрузки PNG/JPG изображения (экспорт из Figma) и автоматической генерации HTML/CSS кода на основе анализа макета.

---

## 📋 Содержание

1. [Общая архитектура](#общая-архитектура)
2. [Этапы разработки](#этапы-разработки)
3. [Технические детали](#технические-детали)
4. [План спринтов](#план-спринтов)
5. [Критерии приёмки](#критерии-приёмки)

---

## Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Visual Readactor                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Загрузка   │───▶│   Анализ     │───▶│  Генерация   │  │
│  │  изображения │    │   макета     │    │  HTML/CSS    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ • Drag&Drop  │    │ • OCR текст  │    │ • HTML tree  │  │
│  │ • URL        │    │ • Цвета      │    │ • CSS rules  │  │
│  │ • Файл       │    │ • Структура  │    │ • Экспорт    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Этапы разработки

### Этап 1: Подготовка инфраструктуры

#### 1.1 Создание компонентов UI
- [ ] **ImageUploader.vue** - компонент загрузки изображения
  - Drag & Drop зона
  - Кнопка выбора файла
  - Превью загруженного изображения
  - Индикатор прогресса загрузки

- [ ] **LayoutAnalyzer.vue** - компонент отображения анализа
  - Визуализация распознанных блоков
  - Отображение найденного текста
  - Палитра цветов макета

- [ ] **CodePreview.vue** - предпросмотр сгенерированного кода
  - Split view: изображение + код
  - Переключение HTML/CSS вкладок
  - Кнопка "Применить код"

#### 1.2 Создание утилит
- [ ] **src/utils/imageAnalyzer.js**
  - `analyzeImage(file)` - основной анализ
  - `detectColors(image)` - извлечение цветов
  - `detectText(image)` - OCR текста
  - `detectLayout(image)` - анализ структуры

- [ ] **src/utils/layoutDetector.js**
  - `detectContainers(imageData)` - поиск контейнеров
  - `detectGrid(imageData)` - поиск grid структур
  - `detectFlex(imageData)` - поиск flex структур
  - `measureSpacing(imageData)` - замеры отступов

- [ ] **src/utils/codeGenerator.js**
  - `generateHTML(structure)` - генерация HTML
  - `generateCSS(structure, colors)` - генерация CSS
  - `optimizeCode(html, css)` - оптимизация кода

#### 1.3 Интеграция в App.vue
- [ ] Новая вкладка "🖼️ Из макета" рядом с HTML/CSS
- [ ] Кнопка "Загрузить макет" в панели управления
- [ ] Модальное окно для процесса анализа

---

### Этап 2: Базовый анализ изображения

#### 2.1 Подключение Tesseract.js
```bash
npm install tesseract.js
```

#### 2.2 Реализация OCR
```javascript
// src/utils/imageAnalyzer.js
import Tesseract from 'tesseract.js';

export async function detectText(imageFile) {
  const { data: { text, words } } = await Tesseract.recognize(
    imageFile,
    'rus+eng',
    {
      logger: m => console.log('OCR progress:', m)
    }
  );
  
  return {
    fullText: text,
    words: words.map(w => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox // {x0, y0, x1, y1}
    }))
  };
}
```

#### 2.3 Извлечение цветовой палитры
```javascript
// src/utils/imageAnalyzer.js
export function detectColors(imageFile) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = quantizeColors(imageData.data, 10);
      
      resolve({
        dominant: colors[0],
        palette: colors,
        background: detectBackgroundColor(imageData.data)
      });
    };
    img.src = URL.createObjectURL(imageFile);
  });
}

function quantizeColors(data, colorCount) {
  // Алгоритм квантования цветов (Median Cut или K-means)
  // Возвращает top N наиболее частых цветов
}
```

---

### Этап 3: Анализ структуры макета

#### 3.1 Детекция границ элементов
```javascript
// src/utils/layoutDetector.js
export function detectLayout(imageFile) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // 1. Конвертация в оттенки серого
      const grayscale = toGrayscale(imageData.data);
      
      // 2. Применение порога (threshold)
      const thresholded = applyThreshold(grayscale, 128);
      
      // 3. Поиск контуров
      const contours = findContours(thresholded, canvas.width, canvas.height);
      
      // 4. Группировка в прямоугольные области
      const regions = groupIntoRectangles(contours);
      
      // 5. Определение иерархии (родитель-потомок)
      const hierarchy = buildHierarchy(regions);
      
      resolve({
        width: canvas.width,
        height: canvas.height,
        regions: hierarchy,
        grid: detectGridStructure(hierarchy),
        spacing: calculateSpacing(hierarchy)
      });
    };
    img.src = URL.createObjectURL(imageFile);
  });
}
```

#### 3.2 Определение типов элементов
```javascript
function classifyElement(region, imageData) {
  const { x, y, width, height } = region.bbox;
  
  // Извлекаем данные области
  const regionData = extractRegion(imageData, x, y, width, height);
  
  // Анализируем соотношение сторон
  const aspectRatio = width / height;
  
  // Анализируем заполненность (solid vs текст)
  const fillRatio = calculateFillRatio(regionData);
  
  // Проверяем на заголовок (большой, жирный текст)
  const isHeading = detectHeading(regionData);
  
  // Проверяем на кнопку (прямоугольник с текстом внутри)
  const isButton = detectButton(regionData, aspectRatio);
  
  // Проверяем на изображение (много цветов, градиенты)
  const isImage = detectImage(regionData);
  
  return {
    type: determineType(isHeading, isButton, isImage, fillRatio),
    confidence: calculateConfidence(isHeading, isButton, isImage),
    suggestedTag: getSuggestedTag(isHeading, isButton, isImage),
    suggestedClass: generateClassName(region)
  };
}
```

#### 3.3 Построение дерева структуры
```javascript
function buildHierarchy(regions) {
  // Сортируем по площади (большие сначала)
  regions.sort((a, b) => b.area - a.area);
  
  const root = { children: [], level: 0 };
  
  regions.forEach(region => {
    // Находим ближайшего родителя
    const parent = findParent(region, regions);
    
    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(region);
      region.level = parent.level + 1;
    } else {
      root.children.push(region);
      region.level = 1;
    }
  });
  
  return root;
}
```

---

### Этап 4: Генерация HTML/CSS кода

#### 4.1 Генерация HTML
```javascript
// src/utils/codeGenerator.js
export function generateHTML(structure) {
  let html = '';
  
  function traverse(node, indent = 0) {
    const padding = '  '.repeat(indent);
    const tag = node.suggestedTag || 'div';
    const className = node.suggestedClass || `element-${node.id}`;
    
    // Открывающий тег
    html += `${padding}<${tag} class="${className}">\n`;
    
    // Текст внутри элемента (если есть OCR данные)
    if (node.text) {
      const textTag = node.isHeading ? 'h2' : 'p';
      html += `${'  '.repeat(indent + 1)}<${textTag}>${node.text}</${textTag}>\n`;
    }
    
    // Дети
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child, indent + 1));
    }
    
    // Закрывающий тег
    html += `${padding}</${tag}>\n`;
  }
  
  traverse(structure.root);
  
  return html.trim();
}
```

#### 4.2 Генерация CSS
```javascript
// src/utils/codeGenerator.js
export function generateCSS(structure, colors) {
  let css = '';
  
  // Базовые стили
  css += `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\n`;
  css += `body {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  line-height: 1.6;\n}\n\n`;
  
  // Стили для каждого элемента
  structure.regions.forEach(region => {
    const selector = `.${region.suggestedClass}`;
    const { x, y, width, height, styles } = region;
    
    css += `${selector} {\n`;
    css += `  position: absolute;\n`;
    css += `  left: ${x}px;\n`;
    css += `  top: ${y}px;\n`;
    css += `  width: ${width}px;\n`;
    css += `  height: ${height}px;\n`;
    
    if (styles.backgroundColor) {
      css += `  background-color: ${styles.backgroundColor};\n`;
    }
    if (styles.borderRadius) {
      css += `  border-radius: ${styles.borderRadius}px;\n`;
    }
    if (styles.padding) {
      css += `  padding: ${styles.padding}px;\n`;
    }
    
    css += `}\n\n`;
  });
  
  // Добавляем цвета из палитры как CSS переменные
  css += `:root {\n`;
  colors.palette.forEach((color, index) => {
    css += `  --color-${index}: ${color};\n`;
  });
  css += `}\n`;
  
  return css;
}
```

#### 4.3 Адаптация под брейкпоинты
```javascript
// src/utils/codeGenerator.js
export function addResponsiveStyles(css, structure) {
  const breakpoints = {
    tablet: 768,
    mobile: 375
  };
  
  // Для tablet
  css += `\n@media (max-width: ${breakpoints.tablet}px) {\n`;
  structure.regions.forEach(region => {
    css += `  .${region.suggestedClass} {\n`;
    css += `    position: static;\n`;
    css += `    width: 100%;\n`;
    css += `    margin-bottom: 15px;\n`;
    css += `  }\n`;
  });
  css += `}\n`;
  
  // Для mobile
  css += `\n@media (max-width: ${breakpoints.mobile}px) {\n`;
  css += `  body {\n    padding: 10px;\n  }\n`;
  structure.regions.forEach(region => {
    css += `  .${region.suggestedClass} {\n`;
    css += `    margin-bottom: 10px;\n`;
    css += `  }\n`;
  });
  css += `}\n`;
  
  return css;
}
```

---

### Этап 5: Интеграция и UI/UX

#### 5.1 Обновление App.vue
```vue
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

    <!-- Остальной интерфейс -->
  </div>
</template>

<script>
import ImageUploader from './components/ImageUploader.vue';

export default {
  components: { ImageUploader },
  data() {
    return {
      showImageUploader: false,
      isAnalyzing: false,
      analysisProgress: 0
    };
  },
  methods: {
    async handleAnalyzed({ html, css, structure }) {
      this.htmlCode = html;
      this.cssCode = css;
      this.showImageUploader = false;
      this.updatePreview();
    }
  }
};
</script>
```

#### 5.2 Компонент ImageUploader.vue
```vue
<template>
  <div class="image-uploader">
    <div class="upload-zone" 
         @dragover.prevent 
         @drop="handleDrop"
         @click="triggerFileInput">
      <div v-if="!imageFile" class="upload-placeholder">
        <span class="icon">📁</span>
        <p>Перетащите изображение сюда</p>
        <p class="hint">или кликните для выбора файла</p>
        <p class="formats">PNG, JPG до 10MB</p>
      </div>
      <img v-else :src="imagePreview" class="preview-image">
    </div>
    
    <div class="upload-actions" v-if="imageFile">
      <button @click="startAnalysis" :disabled="isAnalyzing" class="btn-analyze">
        {{ isAnalyzing ? 'Анализ...' : 'Анализировать макет' }}
      </button>
      <button @click="reset" class="btn-reset">Сбросить</button>
    </div>
    
    <div v-if="isAnalyzing" class="progress-container">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      <p class="progress-text">{{ progressText }}</p>
    </div>
    
    <div v-if="analysisResult" class="analysis-result">
      <h3>Результаты анализа</h3>
      <div class="result-tabs">
        <button :class="{ active: activeTab === 'structure' }" @click="activeTab = 'structure'">
          Структура
        </button>
        <button :class="{ active: activeTab === 'colors' }" @click="activeTab = 'colors'">
          Цвета
        </button>
        <button :class="{ active: activeTab === 'text' }" @click="activeTab = 'text'">
          Текст
        </button>
      </div>
      
      <div class="result-content">
        <!-- Отображение результатов -->
      </div>
    </div>
    
    <div class="modal-actions">
      <button @click="applyCode" :disabled="!analysisResult" class="btn-apply">
        Применить код
      </button>
      <button @click="$emit('close')" class="btn-cancel">Отмена</button>
    </div>
  </div>
</template>
```

---

## Технические детали

### Зависимости
```json
{
  "dependencies": {
    "tesseract.js": "^5.0.0",
    "colorthief": "^2.4.0"
  }
}
```

### Опционально (для продвинутого анализа)
```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.0.0",
    "@tensorflow-models/coco-ssd": "^2.2.0"
  }
}
```

### Производительность

#### Web Workers для тяжёлых вычислений
```javascript
// src/utils/imageAnalyzer.worker.js
import Tesseract from 'tesseract.js';

self.onmessage = async (e) => {
  const { imageFile, task } = e.data;
  
  if (task === 'ocr') {
    const result = await Tesseract.recognize(imageFile, 'rus+eng');
    self.postMessage({ type: 'ocr-complete', data: result });
  }
  
  if (task === 'colors') {
    const colors = extractColors(imageFile);
    self.postMessage({ type: 'colors-complete', data: colors });
  }
};
```

#### Прогресс анализа
```javascript
const analysisSteps = [
  { name: 'Загрузка изображения', progress: 10 },
  { name: 'Распознавание текста (OCR)', progress: 40 },
  { name: 'Извлечение цветовой палитры', progress: 60 },
  { name: 'Анализ структуры макета', progress: 80 },
  { name: 'Генерация HTML/CSS', progress: 100 }
];
```

---

## План спринтов

### Спринт 1: Инфраструктура (3 дня)
- [ ] Установка зависимостей (tesseract.js, colorthief)
- [ ] Создание базовых утилит (imageAnalyzer.js)
- [ ] Создание компонента ImageUploader.vue
- [ ] Интеграция в App.vue

### Спринт 2: OCR и цвета (3 дня)
- [ ] Реализация OCR через Tesseract.js
- [ ] Извлечение цветовой палитры
- [ ] Отображение результатов анализа
- [ ] Прогресс бар и статусы

### Спринт 3: Анализ структуры (4 дня)
- [ ] Детекция границ элементов
- [ ] Классификация элементов (кнопка, текст, изображение)
- [ ] Построение иерархии
- [ ] Визуализация распознанных областей

### Спринт 4: Генерация кода (4 дня)
- [ ] Генерация HTML из структуры
- [ ] Генерация CSS с позиционированием
- [ ] Добавление адаптивных стилей
- [ ] Оптимизация кода

### Спринт 5: Полировка (3 дня)
- [ ] Тестирование на разных макетах
- [ ] Улучшение точности распознавания
- [ ] Обработка ошибок
- [ ] Документация

---

## Критерии приёмки

### Функциональные требования
- [ ] Загрузка PNG/JPG файлов до 10MB
- [ ] Drag & Drop интерфейс
- [ ] OCR распознавание текста (русский + английский)
- [ ] Извлечение цветовой палитры (min 5 цветов)
- [ ] Детекция минимум 3 типов элементов (текст, кнопка, изображение)
- [ ] Генерация валидного HTML
- [ ] Генерация CSS с адаптивностью
- [ ] Применение кода в редактор одной кнопкой

### Нефункциональные требования
- [ ] Время анализа изображения 1920x1080 < 30 секунд
- [ ] Прогресс бар отображает этапы анализа
- [ ] Обработка ошибок с понятными сообщениями
- [ ] Работа в Chrome, Firefox, Safari

### Метрики качества
| Метрика | Цель | Статус |
|---------|------|--------|
| Точность OCR | >90% | 🔄 |
| Точность детекции элементов | >80% | 🔄 |
| Время анализа | <30с | 🔄 |
| Валидность HTML | 100% | 🔄 |
| Адаптивность CSS | Mobile + Tablet | 🔄 |

---

## Риски и решения

### Риск 1: Низкая точность OCR
**Решение:** Использовать предобработку изображения (увеличение контраста, бинаризация)

### Риск 2: Долгий анализ больших изображений
**Решение:** Сжатие изображения перед анализом, использование Web Workers

### Риск 3: Сложные макеты с наложениями
**Решение:** Ограничить поддержку на первый релиз (простые вертикальные макеты)

---

## Примеры тестовых макетов

### Тест 1: Простой лендинг
- Заголовок
- Подзаголовок
- Кнопка CTA
- Изображение продукта
- 3 карточки преимуществ

### Тест 2: Блог
- Header с навигацией
- Заголовок статьи
- Текст статьи
- Sidebar с виджетами
- Footer

### Тест 3: Интернет-магазин
- Карточка товара
- Изображение
- Название
- Цена
- Кнопка "Купить"

---

## Следующие шаги после реализации

1. **Интеграция с Figma API** - прямой экспорт из Figma
2. **Поддержка SVG** - векторные макеты
3. **ML-модели** - обучение на датасете макетов
4. **Экспорт в фреймворки** - React, Vue компоненты
5. **Design Tokens** - генерация токенов из макета

---

*Документ обновляется по мере разработки. См. также Git.md, verstka_html_css.md*
