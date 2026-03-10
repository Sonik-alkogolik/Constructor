# План разработки: Автоподгонка контента (Auto Resize)

## Задача
Реализовать кнопку "Автовёрстка", которая автоматически анализирует HTML, находит все контейнеры и генерирует CSS для выбранного брейкпоинта, чтобы все вложенные элементы не выходили за рамки родителя.

## Логика работы

### Входные данные:
- Выбранный брейкпоинт (Desktop: 1920px, Laptop: 1366px, Tablet: 768px, Mobile: 375px)
- Текущий HTML код (с любыми классами)
- Текущий CSS код

### Алгоритм генерации CSS:

1. **Парсинг HTML и поиск контейнеров**
   - Найти все блочные элементы: `div`, `section`, `nav`, `header`, `footer`, `main`, `article`, `aside`
   - Извлечь все классы у найденных элементов
   - Построить дерево вложенности (родитель → дети)

2. **Определение корневых контейнеров**
   - Найти самые верхнеуровневые контейнеры (не вложенные в другие)
   - Для каждого кореневого контейнера сгенерировать правила

3. **Генерация media query для брейкпоинта**
   ```css
   /* Для каждого найденного класса контейнера */
   @media (max-width: {breakpoint}px) {
     .{container-class} {
       max-width: {breakpoint - 20}px;
       width: 100%;
       margin: 0 auto;
       box-sizing: border-box;
     }
     
     /* Для всех вложенных блочных элементов */
     .{container-class} > * {
       max-width: 100%;
       box-sizing: border-box;
     }
   }
   ```

4. **Расчёт отступов**
   - Для корневых контейнеров: `max-width = breakpoint - 20px` + `margin: 0 auto`
   - Для вложенных элементов: `max-width: 100%` + `box-sizing: border-box`
   - Гарантировать что контент не выходит за рамки родителя

## Этапы реализации

### Этап 1: Подготовка
- [x] Изучить текущую структуру проекта (App.vue, main.js)
- [x] Обновить план с учётом динамических классов
- [x] Создать утилиту `src/utils/cssGenerator.js` для генерации CSS правил
- [x] Добавить кнопку "🚀 Автовёрстка" в панель управления брейкпоинтами в App.vue

### Этап 2: Парсинг HTML
- [x] Реализовать функцию `parseContainers(html)` — извлекает все блочные элементы с классами
- [x] Реализовать функцию `buildContainerTree(html)` — строит дерево вложенности контейнеров
- [x] Реализовать функцию `getRootContainers(tree)` — находит корневые контейнеры верхнего уровня

### Этап 3: Генерация CSS
- [x] Реализовать функцию `generateMediaQuery(breakpoint, containers)` — генерирует media query для выбранных контейнеров
- [x] Реализовать функцию `calculateContainerWidth(breakpoint)` — рассчитывает ширину (breakpoint - 20px)
- [x] Реализовать функцию `generateNestedRules(containerClasses)` — правила для вложенных элементов

### Этап 4: Интеграция в App.vue
- [x] Добавить кнопку "🚀 Автовёрстка" рядом с селектором брейкпоинта
- [x] Подключить генератор CSS к кнопке
- [x] При нажатии на кнопку:
  - Спарсить HTML и найти все контейнеры
  - Сгенерировать media query для текущего брейкпоинта
  - Добавить сгенерированный CSS в конец cssCode
  - Обновить preview

### Этап 5: Тестирование
- [ ] Запустить `npm run dev`
- [ ] Подождать 5 секунд: `timeout /t 5`
- [ ] Сделать запрос: `curl -s http://localhost:3000/ > test_html.log`
- [ ] Проверить что HTML не пустой
- [ ] Протестировать с разными HTML структурами:
  ```html
  <!-- Пример 1: wrapp -->
  <div class="wrapp">
    <div class="wrapp_inner">...</div>
  </div>
  
  <!-- Пример 2: navbar -->
  <nav class="navbar">
    <div class="navbar-container">...</div>
  </nav>
  
  <!-- Пример 3: несколько контейнеров -->
  <section class="hero">
    <div class="hero-content">...</div>
  </section>
  <section class="features">
    <div class="features-grid">...</div>
  </section>
  ```
- [ ] Проверить для всех брейкпоинтов

## Пример результата

**Входной HTML:**
```html
<div class="wrapp">
  <div class="wrapp_inner">
    <nav class="navbar">
      <div class="navbar-container"></div>
    </nav>
  </div>
</div>
```

**После нажатия "Автовёрстка" для Tablet (768px):**
```css
/* Auto-generated for Tablet (768px) */
@media (max-width: 768px) {
  .wrapp {
    max-width: 748px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }
  
  .navbar {
    max-width: 748px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }
  
  /* Вложенные элементы */
  .wrapp > *, .navbar > * {
    max-width: 100%;
    box-sizing: border-box;
  }
}
```

## Тестовый сценарий

### Быстрый тест через curl

```bash
# 1. Запустить сервер (в фоне)
npm run dev

# 2. Подождать 5 секунд
timeout /t 5

# 3. Сделать запрос
curl -s http://localhost:3000/ > test_html.log

# 4. Проверить лог
type test_html.log
# Ожидается: <!DOCTYPE html>...<div id="app"></div>...

# 5. Если пусто - ошибка, проверить консоль и vite config
```

### PowerShell скрипт для тестирования

Создайте файл `test_auto_resize.ps1`:

```powershell
# Остановить предыдущий процесс
Stop-Process -Name "node" -ErrorAction SilentlyContinue

# Запустить сервер
Start-Process npm -ArgumentList "run","dev" -WindowStyle Hidden

# Подождать 5 секунд
Start-Sleep -Seconds 5

# Сделать запрос
$response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing

# Проверить ответ
if ($response.StatusCode -eq 200 -and $response.Content.Length -gt 0) {
    Write-Host "✓ Сервер отвечает (код: $($response.StatusCode), размер: $($response.Content.Length) байт)"
    $response.Content | Out-File -FilePath "test_html.log" -Encoding utf8
} else {
    Write-Host "✗ Ошибка: пустой ответ или код $($response.StatusCode)"
}
```

### Bash скрипт для Git Bash

Создайте файл `test_auto_resize.sh`:

```bash
#!/bin/bash

# Остановить предыдущий процесс
pkill -f "vite" 2>/dev/null

# Запустить сервер
npm run dev &
SERVER_PID=$!

# Подождать 5 секунд
sleep 5

# Сделать запрос
response=$(curl -s -w "\n%{http_code}" http://localhost:3000/)
http_code=$(echo "$response" | tail -n1)
content=$(echo "$response" | sed '$d')

# Проверить ответ
if [ "$http_code" = "200" ] && [ -n "$content" ]; then
    echo "✓ Сервер отвечает (код: $http_code, размер: ${#content} байт)"
    echo "$content" > test_html.log
else
    echo "✗ Ошибка: пустой ответ или код $http_code"
fi

# Остановить сервер
kill $SERVER_PID 2>/dev/null
```

### Ручное тестирование автовёрстки

1. Запустить `npm run dev`
2. Открыть `http://localhost:3000/`
3. Вставить тестовый HTML:
   ```html
   <div class="wrapp">
     <div class="wrapp_inner">
       <h1>Привет, мир!</h1>
       <p>Это пример контента.</p>
     </div>
   </div>
   ```
4. Выбрать брейкпоинт "Tablet (768px)"
5. Нажать кнопку "🚀 Автовёрстка"
6. Проверить что в CSS добавилась media query:
   ```css
   @media (max-width: 768px) {
     .wrapp {
       max-width: 748px;
       width: 100%;
       margin: 0 auto;
     }
     .wrapp_inner {
       max-width: 98%;
       width: 100%;
     }
   }
   ```
7. Изменить размер окна браузера до 768px
8. Убедиться что контент не выходит за рамки и центрирован

## Критерии приёмки

- [x] План составлен с учётом динамических классов
- [x] Кнопка "Автовёрстка" отображается рядом с выбором брейкпоинта
- [x] Парсинг HTML работает для любых классов
- [x] Находятся все блочные контейнеры (div, section, nav, etc.)
- [x] Генерируется корректный media query
- [ ] Все вложенные элементы остаются внутри родителя (требуется тестирование)
- [ ] Контент центрируется автоматически (требуется тестирование)
- [x] CSS код обновляется в редакторе
- [ ] Тест через curl проходит (HTML не пустой) (требуется тестирование)

## Замечания по текущей реализации

### Проблемы которые нужно исправить:

1. **DOMParser недоступен в Node.js** - функция `parseContainers` использует `DOMParser` который доступен только в браузере. Нужно либо:
   - Использовать библиотеку типа `jsdom` или `parse5`
   - Переписать парсинг на регулярные выражения (менее надёжно)
   - Перенести логику парсинга на сторону клиента (в App.vue)

2. **Логика для вложенных элементов** - текущая реализация применяет одинаковые правила ко всем вложенным элементам. Нужно улучшить чтобы:
   - `.wrapp_inner` получал `max-width: 98%` относительно родителя
   - Контент центрировался через `margin: 0 auto`

3. **Дублирование media query** - если уже есть media query для брейкпоинта, нужно обновлять его а не создавать новый

## Брейкпоинты

| Название | Значение | Container max-width |
|----------|----------|---------------------|
| Desktop  | 1920px   | 1900px              |
| Laptop   | 1366px   | 1346px              |
| Tablet   | 768px    | 748px               |
| Mobile   | 375px    | 355px               |

## Поддерживаемые блочные элементы для парсинга

```javascript
const BLOCK_ELEMENTS = [
  'div', 'section', 'nav', 'header', 'footer', 
  'main', 'article', 'aside', 'blockquote', 'figure'
];
```

## Заметки

- Используем `-20px` от брейкпоинта для безопасности (чтобы не было горизонтального скролла)
- `margin: 0 auto` обеспечивает центрирование контейнера
- `box-sizing: border-box` гарантирует что padding не увеличивает ширину
- Работаем с любыми классами, не только `.wrapp`
- Анализируем вложенность чтобы не дублировать правила
