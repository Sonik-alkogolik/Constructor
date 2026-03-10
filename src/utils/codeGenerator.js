/**
 * Генератор HTML/CSS кода из структуры макета
 */

/**
 * Генерация HTML из структуры регионов
 * @param {Object} structure - Структура макета
 * @param {Array} textLines - Распознанные текстовые строки
 * @returns {string} HTML код
 */
export function generateHTML(structure, textLines = []) {
  if (!structure || !structure.regions || structure.regions.length === 0) {
    return '<div class="container">\n  <p>Контент будет сгенерирован после анализа макета</p>\n</div>';
  }

  let html = '';
  const processedRegions = new Set();

  // Сортируем регионы сверху вниз и слева направо
  const sortedRegions = [...structure.regions].sort((a, b) => {
    // Сначала по Y (сверху вниз)
    if (Math.abs(a.y - b.y) > 50) {
      return a.y - b.y;
    }
    // Затем по X (слева направо)
    return a.x - b.x;
  });

  // Находим текстовые строки для каждого региона
  const regionTextMap = mapTextToRegions(structure, textLines);

  sortedRegions.forEach((region, index) => {
    if (processedRegions.has(region.id)) return;

    const regionClass = generateClassName(region, index);
    const tag = determineTag(region, regionTextMap.get(region.id));
    const hasText = regionTextMap.has(region.id);
    const text = hasText ? regionTextMap.get(region.id) : '';
    const children = findChildren(region, sortedRegions);

    html += generateElementHTML(tag, regionClass, text, children, processedRegions);
  });

  return html.trim();
}

/**
 * Генерация HTML для элемента
 */
function generateElementHTML(tag, className, text, children, processedRegions) {
  const indent = '  ';
  let html = `${indent}<${tag} class="${className}">\n`;

  // Добавляем текст если есть
  if (text) {
    const textTag = tag === 'h1' || tag === 'h2' || tag === 'h3' ? 'span' : 
                    tag === 'button' || tag === 'a' ? '' : 'p';
    if (textTag) {
      html += `${indent}  <${textTag}>${escapeHtml(text)}</${textTag}>\n`;
    } else {
      html += `${indent}  ${escapeHtml(text)}\n`;
    }
  }

  // Добавляем детей
  children.forEach(child => {
    processedRegions.add(child.id);
  });

  html += `${indent}</${tag}>\n`;

  return html;
}

/**
 * Генерация CSS из структуры регионов
 * @param {Object} structure - Структура макета
 * @param {Object} colors - Цветовая палитра
 * @param {Array} textLines - Распознанные текстовые строки
 * @returns {string} CSS код
 */
export function generateCSS(structure, colors = {}, textLines = []) {
  let css = '';

  // Базовые стили
  css += generateBaseStyles(colors);

  if (!structure || !structure.regions || structure.regions.length === 0) {
    return css;
  }

  // Стили для каждого региона
  const regionTextMap = mapTextToRegions(structure, textLines);

  structure.regions.forEach((region, index) => {
    const regionClass = generateClassName(region, index);
    const tag = determineTag(region, regionTextMap.get(region.id));
    
    css += generateRegionCSS(regionClass, region, tag, regionTextMap.get(region.id), structure);
  });

  // Адаптивные стили
  css += generateResponsiveCSS(structure);

  return css;
}

/**
 * Базовые стили
 */
function generateBaseStyles(colors) {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: ${colors.background || '#ffffff'};
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

:root {
  --color-primary: ${colors.dominant || '#3498db'};
  --color-background: ${colors.background || '#ffffff'};
}

`;
}

/**
 * CSS для региона
 */
function generateRegionCSS(className, region, tag, text, structure) {
  const { x, y, width, height } = region;
  
  // Определяем тип элемента
  const isFullWidth = width > structure.width * 0.8;
  const isButton = detectButtonType(region, text);
  const isHeading = detectHeadingType(region, text);

  let css = `.${className} {\n`;
  
  // Позиционирование
  if (!isFullWidth) {
    css += `  position: absolute;\n`;
    css += `  left: ${x}px;\n`;
    css += `  top: ${y}px;\n`;
  }
  
  // Размеры
  if (isFullWidth) {
    css += `  width: 100%;\n`;
    css += `  max-width: ${structure.width}px;\n`;
  } else {
    css += `  width: ${width}px;\n`;
  }
  css += `  height: ${height}px;\n`;

  // Стили для кнопок
  if (isButton) {
    css += `  display: inline-flex;\n`;
    css += `  align-items: center;\n`;
    css += `  justify-content: center;\n`;
    css += `  padding: 12px 24px;\n`;
    css += `  background-color: var(--color-primary);\n`;
    css += `  color: #ffffff;\n`;
    css += `  border-radius: 6px;\n`;
    css += `  font-weight: 600;\n`;
  }

  // Стили для заголовков
  if (isHeading) {
    css += `  font-size: ${Math.max(24, height * 0.6)}px;\n`;
    css += `  font-weight: 700;\n`;
    css += `  line-height: 1.2;\n`;
  }

  css += `}\n\n`;

  return css;
}

/**
 * Адаптивные стили
 */
function generateResponsiveCSS(structure) {
  let css = '';

  // Tablet
  css += `@media (max-width: 768px) {\n`;
  css += `  body {\n    padding: 20px;\n  }\n\n`;
  
  structure.regions.forEach((region, index) => {
    const className = generateClassName(region, index);
    css += `  .${className} {\n`;
    css += `    position: static !important;\n`;
    css += `    width: 100% !important;\n`;
    css += `    height: auto !important;\n`;
    css += `    margin-bottom: 15px;\n`;
    css += `  }\n\n`;
  });
  
  css += `}\n\n`;

  // Mobile
  css += `@media (max-width: 375px) {\n`;
  css += `  body {\n    padding: 10px;\n  }\n\n`;
  
  structure.regions.forEach((region, index) => {
    const className = generateClassName(region, index);
    css += `  .${className} {\n`;
    css += `    margin-bottom: 10px;\n`;
    css += `  }\n\n`;
  });
  
  css += `}\n`;

  return css;
}

/**
 * Определение HTML тега для региона
 */
function determineTag(region, text) {
  // Проверяем на кнопку
  if (detectButtonType(region, text)) {
    return 'button';
  }

  // Проверяем на заголовок
  if (detectHeadingType(region, text)) {
    const aspectRatio = region.width / region.height;
    if (aspectRatio > 3) return 'h1';
    if (aspectRatio > 2) return 'h2';
    return 'h3';
  }

  // Проверяем на ссылку навигации
  if (text && text.length < 30 && region.height < 50) {
    return 'a';
  }

  // По умолчанию div
  return 'div';
}

/**
 * Определение кнопки
 */
function detectButtonType(region, text) {
  if (!text) return false;
  
  const buttonKeywords = ['купить', 'заказать', 'отправить', 'submit', 'buy', 'click', 'learn more'];
  const lowerText = text.toLowerCase();
  
  // Кнопка обычно имеет текст и определённое соотношение сторон
  const aspectRatio = region.width / region.height;
  const isButtonShape = aspectRatio > 1.5 && aspectRatio < 6;
  
  return isButtonShape && buttonKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Определение заголовка
 */
function detectHeadingType(region, text) {
  if (!text) return false;
  
  // Заголовок обычно широкий и невысокий
  const aspectRatio = region.width / region.height;
  const isWide = aspectRatio > 2;
  
  // Или содержит мало слов (короткий текст)
  const wordCount = text.split(' ').length;
  const isShort = wordCount <= 8;
  
  return isWide && isShort;
}

/**
 * Поиск дочерних элементов
 */
function findChildren(parent, allRegions) {
  return allRegions.filter(child => {
    if (child.id === parent.id) return false;
    
    // Проверяем находится ли child внутри parent
    return (
      child.x >= parent.x &&
      child.y >= parent.y &&
      child.x + child.width <= parent.x + parent.width &&
      child.y + child.height <= parent.y + parent.height
    );
  });
}

/**
 * Маппинг текста к регионам
 */
function mapTextToRegions(structure, textLines) {
  const map = new Map();

  if (!textLines || textLines.length === 0) {
    return map;
  }

  textLines.forEach(line => {
    const { x, y, width, height, text } = line.bbox || line;
    
    // Находим регион содержащий эту строку
    const containingRegion = structure.regions.find(region => {
      return (
        x >= region.x &&
        y >= region.y &&
        x + width <= region.x + region.width &&
        y + height <= region.y + region.height
      );
    });

    if (containingRegion) {
      const existingText = map.get(containingRegion.id) || '';
      map.set(containingRegion.id, existingText + ' ' + text);
    }
  });

  return map;
}

/**
 * Генерация имени класса
 */
function generateClassName(region, index) {
  const prefixes = ['section', 'block', 'element', 'item', 'box'];
  const prefix = prefixes[index % prefixes.length];
  return `${prefix}-${index + 1}`;
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Оптимизация кода (удаление лишних стилей)
 */
export function optimizeCode(html, css) {
  // Удаляем дублирующиеся стили
  const cssLines = css.split('\n');
  const uniqueLines = [...new Set(cssLines)];
  const optimizedCss = uniqueLines.join('\n');

  return { html, css: optimizedCss };
}

export default {
  generateHTML,
  generateCSS,
  optimizeCode
};
