# Вёрстка по макету из Figma/PNG — Полное руководство

**Visual Readactor** | База знаний | Версия 1.0 | 2026-03-10

---

## 🔗 Навигация по базе знаний

| Документ | Описание |
|----------|----------|
| [📚 Все документы](../File_md/README.md) | Главная навигация по базе знаний |
| [📊 Статус проекта](../File_md/project_status_docs/PROJECT_STATUS.md) | Текущее состояние проекта |
| [📱 Разбор макета](../File_md/brands_slider_docs/brands_slider_analysis.md) | Пример разбора слайдера брендов |
| [🎨 Технологии вёрстки](../File_md/verstka_docs/verstka_html_css.md) | Container Queries, Grid, Flexbox |

---

## 📋 Содержание

1. [Алгоритм работы](#алгоритм-работы)
2. [Анализ макета](#анализ-макета)
3. [Создание HTML структуры](#создание-html-структуры)
4. [Написание CSS стилей](#написание-css-стилей)
5. [Адаптивность](#адаптивность)
6. [Цветовая палитра](#цветовая-палитра)
7. [Типовые паттерны](#типовые-паттерны)
8. [Чек-лист проверки](#чек-лист-проверки)

---

## 🎯 Алгоритм работы

### Шаг 1: Получение макета
```
1. Пользователь показывает изображение (PNG/JPG)
2. Анализируем визуально структуру
3. Определяем тип макета (слайдер, сетка, список, форма)
4. Выделяем основные элементы
```

### Шаг 2: Декомпозиция
```
1. Разбиваем на логические блоки
2. Определяем иерархию (родитель → дети)
3. Находим повторяющиеся элементы
4. Намечаем семантические теги
```

### Шаг 3: Создание HTML
```
1. Пишем структуру контейнеров
2. Добавляем контент (текст, кнопки, изображения)
3. Используем семантические классы (BEM-style)
4. Проверяем вложенность
```

### Шаг 4: Написание CSS
```
1. Базовые стили (reset, box-sizing)
2. Стили контейнеров (flex/grid, размеры)
3. Стили элементов (цвета, шрифты, отступы)
4. Hover/active состояния
5. Адаптивность (@media)
```

### Шаг 5: Тестирование
```
1. Проверка на desktop (1920px)
2. Проверка на tablet (768px)
3. Проверка на mobile (375px)
4. Исправление замечаний
```

---

## 🔍 Анализ макета

### Что смотреть в первую очередь

#### 1. Тип компоновки
| Тип | Признаки | CSS подход |
|-----|----------|------------|
| **Слайдер** | Горизонтальный ряд элементов | `display: flex; overflow-x: auto` |
| **Сетка** | Строки и колонки | `display: grid` |
| **Список** | Вертикальный перечень | `display: flex; flex-direction: column` |
| **Карточки** | Изолированные блоки | `display: grid; grid-template-columns` |
| **Форма** | Поля ввода + кнопки | Стандартная вёрстка форм |

#### 2. Цветовая схема
**Извлекаем цвета:**
- Основной цвет (кнопки, акценты)
- Вторичный цвет (ховеры, градиенты)
- Цвета текста (чёрный, серый)
- Цвета фона (белый, светло-серый)
- Разделители (светло-серые линии)

**Пример палитры из макета:**
```css
--color-primary: #d97706;      /* Оранжевый */
--color-primary-dark: #b45309; /* Тёмный оранжевый */
--color-text-dark: #111827;    /* Чёрный текст */
--color-text-gray: #374151;    /* Серый текст */
--color-divider: #e5e7eb;      /* Разделитель */
--color-bg: #ffffff;           /* Фон */
```

#### 3. Типографика
**Определяем размеры:**
- Заголовки: 20-24px
- Основной текст: 14-16px
- Подписи: 12-13px
- Крупные числа: 20-22px

**Начертание:**
- Обычный: `font-weight: 400`
- Средний: `font-weight: 500`
- Жирный: `font-weight: 600-700`

#### 4. Отступы и размеры
**Измеряем визуально:**
- Внутренние отступы карточки: 20-24px
- Отступы между элементами: 12-16px
- Отступы между секциями: 20-40px
- Размеры кнопок: высота 44-50px

---

## 🏗️ Создание HTML структуры

### Принципы семантической вёрстки

#### 1. Контейнеры
```html
<!-- Слайдер/карусель -->
<div class="slider-container">
  <div class="slider-item">...</div>
</div>

<!-- Сетка карточек -->
<div class="cards-grid">
  <div class="card">...</div>
</div>

<!-- Вертикальный список -->
<div class="list-container">
  <div class="list-item">...</div>
</div>
```

#### 2. Именование классов (BEM-lite)
```
Блок: .card
Элемент: .card__title, .card__content, .card__button
Модификатор: .card--featured, .card--large

Или упрощённо:
.card-title, .card-content, .card-button
```

#### 3. Пример структуры карточки
```html
<div class="card">
  <!-- Изображение/лого -->
  <div class="card-image">
    <img src="..." alt="...">
  </div>
  
  <!-- Заголовок/цена -->
  <div class="card-header">
    <span class="card-label">Подпись</span>
    <span class="card-value">Значение</span>
  </div>
  
  <!-- Разделитель -->
  <div class="card-divider"></div>
  
  <!-- Контент -->
  <div class="card-content">
    <p>Текст</p>
  </div>
  
  <!-- Действие -->
  <button class="card-button">Текст кнопки</button>
</div>
```

#### 4. Доступность (a11y)
```html
<!-- Всегда alt для изображений -->
<img src="logo.png" alt="Название бренда">

<!-- ARIA для сложных виджетов -->
<div class="slider" role="list" aria-label="Список брендов">
  <div class="slide" role="listitem">...</div>
</div>

<!-- Семантические кнопки -->
<button class="btn">Текст</button>
<!-- НЕ <div class="btn"> -->
```

---

## 🎨 Написание CSS стилей

### Порядок написания

#### 1. Базовые стили контейнера
```css
.container {
  display: flex;              /* или grid */
  gap: 16px;                  /* отступы между элементами */
  padding: 20px;              /* внутренние отступы */
  overflow-x: auto;           /* если нужно */
  scroll-behavior: smooth;    /* плавная прокрутка */
}
```

#### 2. Стили элемента
```css
.element {
  flex: 0 0 200px;            /* фиксированная ширина */
  display: flex;
  flex-direction: column;     /* вертикальное расположение */
  align-items: center;        /* центрирование */
  padding: 24px 20px;         /* внутренние отступы */
  background: #ffffff;        /* фон */
  border-radius: 16px;        /* скругление */
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); /* тень */
}
```

#### 3. Типографика
```css
.label {
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;
}

.value {
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
  letter-spacing: 0.5px;
}
```

#### 4. Кнопки
```css
.button {
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

.button:hover {
  background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}
```

#### 5. Hover эффекты для карточек
```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

#### 6. Кастомный скроллбар
```css
.container::-webkit-scrollbar {
  height: 8px;
}

.container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.container::-webkit-scrollbar-thumb {
  background: #d97706;
  border-radius: 4px;
}

.container::-webkit-scrollbar-thumb:hover {
  background: #b45309;
}
```

---

## 📱 Адаптивность

### Брейкпоинты
```css
/* Desktop First или Mobile First */

/* Tablet */
@media (max-width: 768px) {
  .card {
    flex: 0 0 160px;  /* уменьшаем ширину */
  }
}

/* Mobile */
@media (max-width: 375px) {
  .card {
    flex: 0 0 140px;  /* ещё меньше */
  }
  
  .value {
    font-size: 14px;  /* уменьшаем шрифты */
  }
}
```

### Принципы адаптивности

1. **Уменьшение ширины элементов:** 200px → 160px → 140px
2. **Уменьшение отступов:** 16px → 12px → 10px
3. **Уменьшение шрифтов:** на 20-30%
4. **Сохранение пропорций:** все элементы масштабируются равномерно
5. **Touch-friendly:** кнопки не менее 44px высотой

### Пример полной адаптивности
```css
/* Desktop */
.slider {
  padding: 20px;
  gap: 16px;
}

.card {
  flex: 0 0 200px;
  padding: 24px 20px;
}

/* Tablet */
@media (max-width: 768px) {
  .slider {
    padding: 12px;
    gap: 12px;
  }
  
  .card {
    flex: 0 0 160px;
    padding: 16px 12px;
  }
  
  .logo {
    height: 50px;
  }
  
  .value {
    font-size: 16px;
  }
}

/* Mobile */
@media (max-width: 375px) {
  .slider {
    padding: 10px;
    gap: 10px;
  }
  
  .card {
    flex: 0 0 140px;
    padding: 14px 10px;
  }
  
  .logo {
    height: 40px;
  }
  
  .label {
    font-size: 11px;
  }
  
  .value {
    font-size: 14px;
  }
  
  .button {
    padding: 10px 12px;
    font-size: 11px;
  }
}
```

---

## 🎨 Цветовая палитра

### Как извлекать цвета из макета

#### 1. Основной цвет (Primary)
**Где искать:** кнопки, акценты, активные состояния  
**Пример:** `#d97706` (оранжевый)

#### 2. Вторичный цвет (Secondary)
**Где искать:** ховеры, градиенты, менее важные акценты  
**Пример:** `#b45309` (тёмный оранжевый)

#### 3. Цвета текста
- **Заголовки:** `#111827` (почти чёрный)
- **Основной:** `#374151` (тёмно-серый)
- **Второстепенный:** `#6b7280` (серый)

#### 4. Цвета фона
- **Основной:** `#ffffff` (белый)
- **Вторичный:** `#f9fafb` (светло-серый)
- **Разделители:** `#e5e7eb` (светло-серый)

### CSS переменные для цветов
```css
:root {
  /* Primary */
  --color-primary: #d97706;
  --color-primary-hover: #b45309;
  --color-primary-active: #92400e;
  
  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-tertiary: #6b7280;
  
  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  
  /* Border */
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
}
```

---

## 📦 Типовые паттерны

### 1. Карточка товара/услуги
```html
<div class="product-card">
  <div class="product-image">
    <img src="..." alt="...">
  </div>
  <div class="product-info">
    <h3 class="product-title">Название</h3>
    <p class="product-price">1 999 ₽</p>
  </div>
  <button class="product-button">В корзину</button>
</div>
```

### 2. Слайдер брендов
```html
<div class="brands-slider">
  <div class="brand-card">
    <div class="brand-logo">
      <img src="..." alt="BRAND">
    </div>
    <div class="brand-price">
      <span class="price-label">от</span>
      <span class="price-value">15 000 ₽</span>
    </div>
    <button class="brand-button">Заказать</button>
  </div>
</div>
```

### 3. Сетка преимуществ
```html
<div class="features-grid">
  <div class="feature-item">
    <div class="feature-icon">🚀</div>
    <h4 class="feature-title">Быстро</h4>
    <p class="feature-text">Описание преимущества</p>
  </div>
</div>
```

### 4. Форма с кнопкой
```html
<form class="contact-form">
  <div class="form-group">
    <label class="form-label">Имя</label>
    <input type="text" class="form-input" placeholder="Ваше имя">
  </div>
  <button type="submit" class="form-button">Отправить</button>
</form>
```

### 5. Навигационное меню
```html
<nav class="main-nav">
  <a href="#" class="nav-link">Главная</a>
  <a href="#" class="nav-link">О нас</a>
  <a href="#" class="nav-link">Контакты</a>
</nav>
```

---

## ✅ Чек-лист проверки

### Перед сдачей вёрстки

#### HTML
- [ ] Все классы названы по BEM или логично
- [ ] Есть alt у всех изображений
- [ ] Кнопки через `<button>`, не `<div>`
- [ ] Семантическая структура (заголовки по уровням)
- [ ] Нет лишних вложенностей

#### CSS
- [ ] `box-sizing: border-box` глобально
- [ ] Отступы через `gap` где возможно
- [ ] Цвета через CSS переменные
- [ ] Hover состояния для интерактивных элементов
- [ ] Transition для плавности (0.2-0.3s)

#### Адаптивность
- [ ] Проверено на 1920px (desktop)
- [ ] Проверено на 1366px (laptop)
- [ ] Проверено на 768px (tablet)
- [ ] Проверено на 375px (mobile)
- [ ] Нет горизонтального скролла
- [ ] Текст читается на всех размерах
- [ ] Кнопки кликабельны (минимум 44px)

#### Доступность
- [ ] Контраст текста достаточный (WCAG AA)
- [ ] Focus виден для клавиатуры
- [ ] ARIA для сложных виджетов
- [ ] Логичный порядок фокуса

#### Производительность
- [ ] Изображения оптимизированы
- [ ] Lazy loading для изображений
- [ ] Нет лишних анимаций
- [ ] CSS минифицирован

---

## 🚀 Шпаргалка по быстрым решениям

### Горизонтальная прокрутка
```css
.slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Фиксированная ширина карточек
```css
.card {
  flex: 0 0 200px;  /* не сжимать, не растягивать */
}
```

### Центрирование контента
```css
.centered {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Градиентная кнопка
```css
.btn {
  background: linear-gradient(135deg, #color1 0%, #color2 100%);
}
```

### Тень для карточки
```css
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### Плавный ховер
```css
.element {
  transition: transform 0.2s, box-shadow 0.2s;
}

.element:hover {
  transform: translateY(-4px);
}
```

---

## 📚 Дополнительные ресурсы

### Инструменты
- [ColorPick Eyedropper](https://chrome.google.com/webstore) — выбор цвета
- [WhatFont](https://chrome.google.com/webstore) — определение шрифтов
- [PerfectPixel](https://chrome.google.com/webstore) — наложение макета

### Документация
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)
- [web.dev](https://web.dev/)

### Практика
- [Frontend Mentor](https://www.frontendmentor.io/)
- [CSS Battle](https://cssbattle.dev/)

---

*Документ обновляется. Следующая версия: 2026-03-17*

*Создано для Visual Readactor — база знаний по вёрстке*
