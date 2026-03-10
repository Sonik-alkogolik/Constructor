/**
 * CSS Generator для автоподгонки контента под брейкпоинты
 * Использует flex-wrap и grid для автоматического переноса элементов
 */

// Блочные элементы, которые считаем контейнерами
const BLOCK_ELEMENTS = [
  'div', 'section', 'nav', 'header', 'footer',
  'main', 'article', 'aside', 'blockquote', 'figure'
];

// Брейкпоинты
const BREAKPOINTS = {
  desktop: 1920,
  laptop: 1366,
  tablet: 768,
  mobile: 375
};

/**
 * Парсит HTML и находит все контейнеры с классами
 * Учитывает вложенность по открывающим/закрывающим тегам
 * @param {string} html - HTML код
 * @returns {Array<{tag: string, classes: string[], level: number, children: string[]}>} - Массив контейнеров
 */
export function parseContainers(html) {
  const containers = [];

  // Регулярка для поиска всех тегов (открывающих и закрывающих) блочных элементов
  const allTagsRegex = /<(\/)?(div|section|nav|header|footer|main|article|aside|blockquote|figure)(?:\s+[^>]*?)?(?:\s+class\s*=\s*["']([^"']+)["'][^>]*)?[^>]*>/gi;

  // Стек для отслеживания вложенности блочных элементов
  const tagStack = [];

  let match;
  while ((match = allTagsRegex.exec(html)) !== null) {
    const isClosingTag = match[1] === '/';
    const tagName = match[2].toLowerCase();
    const classString = match[3] || '';
    const classes = classString.split(/\s+/).filter(c => c.trim());

    if (isClosingTag) {
      // Закрывающий тег - удаляем из стека
      if (tagStack.length > 0) {
        tagStack.pop();
      }
    } else {
      // Открывающий тег
      const level = tagStack.length;
      const parentClasses = level > 0 && tagStack[level - 1] ? tagStack[level - 1].classes : [];

      if (classes.length === 0) {
        tagStack.push({ tag: tagName, classes: [], level });
        continue;
      }

      const container = {
        tag: tagName,
        classes: [...classes],
        level: level,
        parentClasses: [...parentClasses],
        children: []
      };

      // Добавляем этот контейнер как дочерний родителю
      if (level > 0 && tagStack.length > 0) {
        const parent = tagStack[tagStack.length - 1];
        if (parent && parent.classes) {
          parent.classes.forEach(pc => {
            const parentContainer = containers.find(c => c.classes.includes(pc));
            if (parentContainer) {
              classes.forEach(cc => {
                if (!parentContainer.children.includes(cc)) {
                  parentContainer.children.push(cc);
                }
              });
            }
          });
        }
      }

      containers.push(container);

      // Добавляем в стек для отслеживания вложенности
      tagStack.push({ tag: tagName, classes: classes, level });
    }
  }

  return containers;
}

/**
 * Определяет тип контейнера на основе количества детей и структуры
 * @param {Array} children - Дочерние классы
 * @returns {string} - 'grid' | 'flex' | 'block'
 */
function determineContainerType(children) {
  // Если есть дети - используем flex или grid
  if (children.length > 0) {
    // Если детей много (3+) - используем grid
    if (children.length >= 3) {
      return 'grid';
    }
    // Если 1-2 детей - используем flex
    return 'flex';
  }
  return 'block';
}

/**
 * Генерирует CSS правила для контейнера с учётом его типа
 * @param {string} breakpoint - Название брейкпоинта
 * @param {string} html - HTML код
 * @returns {string} - Сгенерированный CSS
 */
export function generateMediaQuery(breakpoint, html) {
  const breakpointValue = BREAKPOINTS[breakpoint];

  if (!breakpointValue) {
    console.error(`Unknown breakpoint: ${breakpoint}`);
    return '';
  }

  const allContainers = parseContainers(html);

  if (allContainers.length === 0) {
    console.warn('No containers found in HTML');
    return '';
  }

  const containerWidth = breakpointValue - 20;
  const cssRules = [];
  const processedClasses = new Set();

  // Базовые стили для предотвращения переполнения
  const baseStyles = `  /* Базовые стили для предотвращения переполнения */
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: hidden;
    min-width: 100%;
  }

  /* Универсальное правило - все элементы не шире родителя */
  * {
    box-sizing: border-box;
    min-width: 0;
  }

  /* Изображения и медиа адаптируются */
  img, video, iframe, embed, object, svg {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Текст переносится */
  p, h1, h2, h3, h4, h5, h6, span, a, li, td, th {
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }`;

  // Генерируем правила для каждого контейнера
  allContainers.forEach(container => {
    container.classes.forEach(className => {
      if (processedClasses.has(className)) return;
      processedClasses.add(className);

      const selector = `.${className}`;
      const containerType = determineContainerType(container.children);
      const hasChildren = container.children.length > 0;

      if (container.level === 0) {
        // Корневой контейнер
        let rules = `  ${selector} {
    max-width: ${containerWidth}px;
    width: 100%;
    margin: 0 auto;
    padding: 10px;
    box-sizing: border-box;`;

        if (hasChildren) {
          if (containerType === 'grid') {
            rules += `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 15px;`;
          } else if (containerType === 'flex') {
            rules += `
    display: flex;
    flex-wrap: wrap;
    gap: 15px;`;
          }
        }

        rules += `\n  }`;
        cssRules.push(rules);

        // Правила для прямых потомков
        if (hasChildren) {
          cssRules.push(`
  ${selector} > * {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
  }`);
        }
      } else {
        // Вложенный контейнер
        let rules = `  ${selector} {
    width: 100%;
    max-width: 100%;
    padding: 10px;
    box-sizing: border-box;`;

        if (hasChildren) {
          if (containerType === 'grid') {
            rules += `
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;`;
          } else if (containerType === 'flex') {
            rules += `
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex-direction: column;`;
          }
        }

        rules += `\n  }`;
        cssRules.push(rules);

        // Правила для прямых потомков
        if (hasChildren) {
          cssRules.push(`
  ${selector} > * {
    width: 100%;
    flex: 1 1 100%;
    min-width: 0;
  }`);
        }
      }
    });
  });

  // Формируем итоговый media query
  const mediaQuery = `
/* Auto-generated for ${breakpoint} (${breakpointValue}px) */
@media (max-width: ${breakpointValue}px) {
${baseStyles}

${cssRules.join('\n\n')}
}`;

  return mediaQuery;
}

/**
 * Добавляет сгенерированный CSS к существующему
 * @param {string} existingCss - Существующий CSS
 * @param {string} breakpoint - Название брейкпоинта
 * @param {string} html - HTML код для анализа
 * @returns {string} - Обновлённый CSS
 */
export function appendGeneratedCss(existingCss, breakpoint, html) {
  const generatedCss = generateMediaQuery(breakpoint, html);

  if (!generatedCss) {
    return existingCss;
  }

  const breakpointValue = BREAKPOINTS[breakpoint];
  const mediaQueryMarker = `@media (max-width: ${breakpointValue}px)`;

  if (existingCss.includes(mediaQueryMarker)) {
    const regex = new RegExp(
      `/\\* Auto-generated for ${breakpoint}.*?\\}\\s*\\}`,
      's'
    );
    return existingCss.replace(regex, generatedCss);
  }

  return existingCss + '\n' + generatedCss;
}

export default {
  parseContainers,
  generateMediaQuery,
  appendGeneratedCss,
  BREAKPOINTS
};
