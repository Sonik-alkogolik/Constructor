# Вёрстка HTML/CSS - Передовые технологии и практики

## 📖 База знаний по вёрстке

---

## 🔥 Современные подходы к вёрстке

### 1. Container Queries (Запрос к контейнеру)
Новая альтернатива media queries - стили зависят от размера контейнера, а не viewport.

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

**Поддержка:** Chrome 105+, Safari 16+, Firefox 110+

---

### 2. CSS Grid Subgrid
Позволяет вложенным сеткам наследовать треки родительской сетки.

```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.child {
  display: grid;
  grid-template-columns: subgrid;
  grid-row: span 3;
}
```

**Поддержка:** Firefox 71+, Chrome 117+, Safari 16.4+

---

### 3. CSS Logical Properties
Свойства, зависящие от направления письма (writing-mode).

```css
/* Вместо margin-left/margin-right */
.element {
  margin-inline-start: 20px;
  margin-inline-end: 10px;
  padding-block: 15px;
}
```

---

### 4. CSS Nesting (Вложенность)
Нативная вложенность селекторов без препроцессоров.

```css
.card {
  padding: 20px;
  
  & .title {
    font-size: 24px;
    
    &:hover {
      color: blue;
    }
  }
}
```

**Поддержка:** Chrome 112+, Safari 17+, Firefox 117+

---

### 5. :has() Selector
Родительский селектор - стилизация родителя по детям.

```css
/* Стилизовать card если есть img */
.card:has(> img) {
  padding: 0;
}

/* Стилизовать form если есть :invalid */
form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}
```

---

### 6. CSS Cascade Layers
Управление специфичностью через слои.

```css
@layer reset, base, components, utilities;

@layer reset {
  * { box-sizing: border-box; }
}

@layer components {
  .button { padding: 10px 20px; }
}
```

---

### 7. CSS Custom Properties (Переменные)
Динамические переменные для темизации.

```css
:root {
  --color-primary: #3498db;
  --spacing-md: 16px;
  --font-size-base: 16px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
}

/* Темизация */
.dark-theme {
  --color-primary: #2c3e50;
}
```

---

## 📱 Адаптивная вёрстка - лучшие практики

### Mobile First подход
```css
/* Базовые стили для mobile */
.container {
  padding: 10px;
  font-size: 14px;
}

/* Планшет и выше */
@media (min-width: 768px) {
  .container {
    padding: 20px;
    font-size: 16px;
  }
}

/* Desktop и выше */
@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Fluid Typography (Плавные шрифты)
```css
html {
  font-size: clamp(14px, 2vw + 10px, 18px);
}

h1 {
  font-size: clamp(1.5rem, 4vw + 1rem, 3rem);
}
```

### Fluid Spacing
```css
:root {
  --space-min: 1rem;
  --space-max: 4rem;
  --space: clamp(
    var(--space-min),
    5vw,
    var(--space-max)
  );
}

.container {
  padding: var(--space);
}
```

---

## 🎨 Grid и Flexbox - паттерны

### Grid - Адаптивная сетка без media queries
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

### Grid - Holy Layout
```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### Flexbox - Карточки одинаковой высоты
```css
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
}

.card-content {
  flex-grow: 1;
}
```

---

## 🖼️ Работа с изображениями

### Responsive Images
```html
<picture>
  <source 
    media="(min-width: 1200px)" 
    srcset="large.jpg"
  >
  <source 
    media="(min-width: 768px)" 
    srcset="medium.jpg"
  >
  <img src="small.jpg" alt="Description" loading="lazy">
</picture>
```

### Aspect Ratio
```css
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Lazy Loading
```html
<img src="image.jpg" loading="lazy" alt="...">
<iframe src="video.html" loading="lazy"></iframe>
```

---

## ⚡ Производительность

### Critical CSS
```html
<head>
  <style>
    /* Критичный CSS для первого экрана */
    .header { ... }
    .hero { ... }
  </style>
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
```

### CSS Containment
```css
.isolated-component {
  contain: layout style paint;
}
```

### Content Visibility
```css
.offscreen-content {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

---

## 🧩 Компонентный подход

### BEM (Block Element Modifier)
```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__content { }

/* Modifier */
.card--featured { }
.card__title--large { }
```

### Utility-First (Tailwind-style)
```html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 class="text-xl font-bold text-gray-800">Title</h2>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>
```

---

## 🎯 Accessibility (a11y)

### Semantic HTML
```html
<!-- Плохо -->
<div class="button" onclick="submit()">Отправить</div>

<!-- Хорошо -->
<button type="button" onclick="submit()">Отправить</button>
```

### Focus States
```css
/* Видимый фокус для клавиатуры */
button:focus-visible {
  outline: 3px solid #3498db;
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🛠️ Инструменты разработчика

### CSS Preprocessors
- **Sass/SCSS** - переменные, миксины, вложенность
- **Less** - похож на Sass, но легче
- **Stylus** - минималистичный синтаксис

### PostCSS Plugins
- **autoprefixer** - автопрефиксы для браузеров
- **cssnano** - минификация CSS
- **postcss-preset-env** - полифилы для новых свойств

### Build Tools
- **Vite** - быстрый сборщик (используется в проекте)
- **Webpack** - мощный сборщик
- **Parcel** - сборщик без конфигурации

---

## 📊 Тренды 2026 года

1. **AI-assisted coding** - генерация кода по макету
2. **Design Tokens** - единая система переменных
3. **CSS Houdini** - кастомные свойства CSS
4. **View Transitions API** - плавные переходы между страницами
5. **Scroll-driven Animations** - анимации по скроллу

```css
/* Scroll-driven animation */
.progress-bar {
  animation: progress linear;
  animation-timeline: scroll();
}

@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}
```

---

## 📚 Ресурсы для обучения

### Документация
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)
- [web.dev](https://web.dev/)

### Практика
- [CSS Battle](https://cssbattle.dev/)
- [Frontend Mentor](https://www.frontendmentor.io/)
- [Codepen](https://codepen.io/)

### Инструменты
- [Can I Use](https://caniuse.com/) - проверка поддержки
- [CSS Gradient](https://cssgradient.io/) - генератор градиентов
- [Clippy](https://bennettfeely.com/clippy/) - генератор clip-path

---

## 🔄 Обновления

### 2026-03-10
- Добавлены Container Queries
- Добавлены CSS Nesting и :has()
- Обновлены паттерны Grid/Flexbox
- Добавлен раздел AI-assisted coding

---

*База знаний постоянно обновляется. Следите за обновлениями в Git.md*
