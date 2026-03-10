# Git Knowledge Base

## 📚 База знаний проекта Visual Readactor

---

## 🎯 Цель проекта
Визуальный конструктор HTML/CSS с возможностью:
- Редактирования HTML и CSS кода в реальном времени
- Предпросмотра на разных брейкпоинтах (Desktop, Laptop, Tablet, Mobile)
- **Автоматической генерации вёрстки по изображению (PNG/JPG из Figma)**
- Автовёрстки под выбранный брейкпоинт

---

## 🚀 Ключевые технологии

### Frontend
- **Vue 3** (Composition API / Options API)
- **Vite** (сборка и dev-сервер)
- **Pinia** (state management)

### Анализ изображений
- **Tesseract.js** - распознавание текста из изображений
- **OpenCV.js** - компьютерное зрение для анализа структуры
- **TensorFlow.js** - ML-модели для сегментации элементов
- **Vision API** (опционально) - GPT-4 Vision, Google Cloud Vision

### CSS Generation
- **PostCSS** - парсинг и генерация CSS
- **css-tree** - AST для CSS
- **Собственный парсер** - для HTML структур

---

## 📁 Структура проекта

```
Visual_Readactor/
├── src/
│   ├── App.vue                 # Главный компонент
│   ├── main.js                 # Точка входа
│   ├── utils/
│   │   ├── cssGenerator.js     # Генератор CSS для автовёрстки
│   │   ├── imageAnalyzer.js    # [NEW] Анализ изображений
│   │   ├── layoutDetector.js   # [NEW] Детектор структуры макета
│   │   └── codeGenerator.js    # [NEW] Генератор HTML/CSS кода
│   ├── components/
│   │   ├── ImageUploader.vue   # [NEW] Загрузка изображения
│   │   ├── LayoutPreview.vue   # [NEW] Предпросмотр структуры
│   │   └── CodeEditor.vue      # Редактор кода
│   └── stores/
│       └── project.js          # [NEW] Хранилище проекта
├── public/
│   └── models/                 # [NEW] ML модели для анализа
├── Git.md                      # Эта база знаний
├── uploading.md                # План разработки
├── verstka_html_css.md         # Технологии вёрстки
└── test_*.md                   # Тестовые сценарии
```

---

## 🔧 Текущий функционал (реализовано)

### ✅ Автовёрстка под брейкпоинты
- Парсинг HTML и поиск контейнеров
- Определение вложенности элементов
- Генерация media query с flex-wrap и grid
- Автоматический перенос элементов (flex-direction: column)

### ✅ Редактор кода
- HTML редактор с подсветкой
- CSS редактор с подсветкой
- Предпросмотр в iframe
- Инспектор элементов (выделение и редактирование стилей)

### ✅ Брейкпоинты
- Desktop (1920px)
- Laptop (1366px)
- Tablet (768px)
- Mobile (375px)

---

## 🎨 Функционал в разработке

### 🖼️ Import from Figma (Image to Code)
- Загрузка PNG/JPG изображения
- Анализ структуры макета
- Распознавание текста (OCR)
- Детекция цветов и шрифтов
- Генерация HTML/CSS кода

### 📦 Экспорт/Импорт проекта
- Сохранение проекта в JSON
- Экспорт в ZIP (HTML + CSS + assets)
- Интеграция с GitHub/GitLab

---

## 📊 Метрики качества

| Метрика | Значение | Статус |
|---------|----------|--------|
| Сборка | ✅ Проходит | Готово |
| Dev сервер | ✅ Порт 3000 | Готово |
| Автовёрстка | ✅ Flex/Grid | Готово |
| Image Import | 🔄 В разработке | План |
| OCR | ⏳ Запланировано | План |
| ML анализ | ⏳ Запланировано | План |

---

## 🔗 Полезные ссылки

### Библиотеки
- [Tesseract.js](https://github.com/naptha/tesseract.js) - OCR для браузера
- [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) - компьютерное зрение
- [TensorFlow.js](https://www.tensorflow.org/js) - машинное обучение
- [css-tree](https://github.com/csstree/csstree) - парсер CSS
- [htmlparser2](https://github.com/fb55/htmlparser2) - парсер HTML

### API
- [GPT-4 Vision](https://platform.openai.com/docs/guides/vision)
- [Google Cloud Vision](https://cloud.google.com/vision)
- [AWS Rekognition](https://aws.amazon.com/rekognition/)

### Figma
- [Figma API](https://www.figma.com/developers/api)
- [Figma Plugin Boilerplate](https://github.com/figma/plugin-boilerplate)

---

## 📝 История изменений

### 2026-03-10
- ✅ Исправлен парсер контейнеров (учёт закрывающих тегов)
- ✅ Добавлена логика flex-wrap для переноса элементов
- ✅ Добавлена логика grid auto-fit для адаптивных сеток
- ✅ Улучшены базовые стили для предотвращения переполнения
- ✅ Создана база знаний Git.md
- ✅ **Реализован базовый функционал Image to Code:**
  - Компонент ImageUploader.vue для загрузки изображений
  - Утилита imageAnalyzer.js для OCR и анализа структуры
  - Утилита codeGenerator.js для генерации HTML/CSS
  - Интеграция в главный компонент App.vue
  - Модальное окно для работы с макетами
- ✅ Установлены зависимости: tesseract.js, colorthief
- ✅ **Создана полная база знаний:**
  - `File_md/README.md` — главная навигация
  - `File_md/verstka_figma_md.md` — руководство по вёрстке по макету
  - `File_md/brands_slider_analysis.md` — разбор макета слайдера брендов
  - 8 документов в структурированных подпапках

---

## 👨‍ Команда разработки
- Lead Developer: AI Assistant
- Project: Visual Readactor
- Repository: Local / Future GitHub

---

## 🎯 Roadmap

1. **Q1 2026** - Image to Code (базовый функционал) ✅ **В ПРОЦЕССЕ**
   - [✅] Загрузка изображений (Drag & Drop)
   - [✅] OCR распознавание текста
   - [✅] Извлечение цветовой палитры
   - [✅] Анализ структуры макета
   - [✅] Генерация HTML/CSS кода
   - [🔄] Тестирование и полировка

2. **Q2 2026** - Интеграция с Figma API
3. **Q3 2026** - ML-модели для точной сегментации
4. **Q4 2026** - Экспорт в различные фреймворки (React, Vue, Angular)
