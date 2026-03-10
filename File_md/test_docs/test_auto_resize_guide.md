# Тестирование автовёрстки

## Проблема
Контент выходит за пределы контейнера на ширине 375px (mobile)

## Решение
Новая логика автовёрстки использует:
1. **flex-wrap: wrap** - для автоматического переноса элементов
2. **grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))** - для адаптивных сеток
3. **flex-direction: column** - для вложенных контейнеров

## Как это работает

### Для корневых контейнеров (level 0):
```css
.container {
  max-width: 355px; /* breakpoint - 20px */
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  
  /* Если детей 3+ */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 15px;
  
  /* Если детей 1-2 */
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
```

### Для вложенных контейнеров (level 1+):
```css
.nested-container {
  width: 100%;
  max-width: 100%;
  padding: 10px;
  
  /* Вертикальное расположение */
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 10px;
}
```

## Тестовые сценарии

### Тест 1: Grid с 3 детьми
**HTML:**
```html
<div class="content-block">
  <div class="content-card">Карточка 1</div>
  <div class="content-card">Карточка 2</div>
  <div class="content-card">Карточка 3</div>
</div>
```

**Ожидаемый результат:**
- На mobile (375px): карточки выстроятся в колонку по 1 в ряд
- Каждая карточка займёт 100% ширины родителя
- Grid автоматически перенесёт элементы

### Тест 2: Flex с 2 детьми
**HTML:**
```html
<div class="sidebar-container">
  <div class="sidebar-main">Основной контент</div>
  <aside class="sidebar-widget">Сайдбар</aside>
</div>
```

**Ожидаемый результат:**
- На mobile: элементы перенесутся друг под друга
- flex-wrap: wrap обеспечит перенос

### Тест 3: Глубокая вложенность
**HTML:**
```html
<div class="wrapp">
  <div class="wrapp_inner">
    <div class="content-block">
      <div class="content-card">Карточка</div>
    </div>
  </div>
</div>
```

**Ожидаемый результат:**
- wrapp: max-width: 355px, margin: 0 auto
- wrapp_inner: width: 100%, flex-direction: column
- content-block: grid с auto-fit
- content-card: 100% ширины

## Инструкция по тестированию

1. Запустить сервер: `npm run dev`
2. Открыть http://localhost:3000
3. Вставить тестовый HTML
4. Выбрать брейкпоинт **Mobile (375px)**
5. Нажать **🚀 Автовёрстка**
6. Проверить что:
   - ✅ Контент не выходит за рамки
   - ✅ Элементы переносятся вниз (flex-wrap)
   - ✅ Grid адаптируется (auto-fit)
   - ✅ Вертикальный скролл работает

## Проверка через DevTools

1. Открыть DevTools (F12)
2. Включить Device Toolbar (Ctrl+Shift+M)
3. Выбрать "Responsive" и установить ширину 375px
4. Проверить computed стили для контейнеров:
   - `display: grid` или `display: flex`
   - `flex-wrap: wrap`
   - `grid-template-columns: 1fr` (на mobile)

## Критерии успеха

- [ ] Все элементы остаются внутри родителя
- [ ] Элементы переносятся вниз (не обрезаются)
- [ ] Grid использует 1fr для mobile
- [ ] Flex-wrap работает для flex контейнеров
- [ ] Нет горизонтального скролла
- [ ] Контент центрирован на странице
