/**
 * Анализатор изображений для Image to Code
 * Использует Tesseract.js для OCR и ColorThief для палитры
 */

import Tesseract from 'tesseract.js';

/**
 * Распознавание текста из изображения (OCR)
 * @param {File} imageFile - Файл изображения
 * @returns {Promise<{fullText: string, words: Array}>}
 */
export async function detectText(imageFile) {
  try {
    const { data } = await Tesseract.recognize(imageFile, 'rus+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Обрабатываем слова с bounding boxes
    const words = data.words
      .filter(w => w.confidence > 50) // Фильтруем ненадёжные распознавания
      .map(w => ({
        text: w.text,
        confidence: w.confidence,
        bbox: {
          x: w.bbox.x0,
          y: w.bbox.y0,
          width: w.bbox.x1 - w.bbox.x0,
          height: w.bbox.y1 - w.bbox.y0
        }
      }));

    // Группируем слова по строкам
    const lines = groupWordsIntoLines(words);

    return {
      fullText: data.text,
      words,
      lines
    };
  } catch (error) {
    console.error('OCR error:', error);
    return { fullText: '', words: [], lines: [] };
  }
}

/**
 * Группировка слов в строки
 */
function groupWordsIntoLines(words) {
  const lines = [];
  const sortedWords = [...words].sort((a, b) => a.bbox.y - b.bbox.y);

  let currentLine = [];
  let currentY = null;
  const lineThreshold = 10; // Пикселей для группировки в строку

  sortedWords.forEach(word => {
    if (currentY === null || Math.abs(word.bbox.y - currentY) <= lineThreshold) {
      currentLine.push(word);
      currentY = word.bbox.y;
    } else {
      // Сортируем слова в строке по X
      currentLine.sort((a, b) => a.bbox.x - b.bbox.x);
      lines.push({
        text: currentLine.map(w => w.text).join(' '),
        words: currentLine,
        bbox: {
          x: Math.min(...currentLine.map(w => w.bbox.x)),
          y: currentLine[0].bbox.y,
          width: Math.max(...currentLine.map(w => w.bbox.x + w.bbox.width)) - Math.min(...currentLine.map(w => w.bbox.x)),
          height: Math.max(...currentLine.map(w => w.bbox.height))
        }
      });
      currentLine = [word];
      currentY = word.bbox.y;
    }
  });

  // Добавляем последнюю строку
  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.bbox.x - b.bbox.x);
    lines.push({
      text: currentLine.map(w => w.text).join(' '),
      words: currentLine,
      bbox: {
        x: Math.min(...currentLine.map(w => w.bbox.x)),
        y: currentLine[0].bbox.y,
        width: Math.max(...currentLine.map(w => w.bbox.x + w.bbox.width)) - Math.min(...currentLine.map(w => w.bbox.x)),
        height: Math.max(...currentLine.map(w => w.bbox.height))
      }
    });
  }

  return lines;
}

/**
 * Извлечение цветовой палитры из изображения
 * @param {File} imageFile - Файл изображения
 * @returns {Promise<{dominant: string, palette: string[], background: string}>}
 */
export async function detectColors(imageFile) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = quantizeColors(imageData.data, 8);

      // Определяем фоновый цвет (анализ краёв изображения)
      const backgroundColor = detectBackgroundColor(imageData.data, canvas.width, canvas.height);

      resolve({
        dominant: palette[0] || '#ffffff',
        palette: palette,
        background: backgroundColor
      });
    };

    img.onerror = () => {
      resolve({
        dominant: '#ffffff',
        palette: ['#ffffff'],
        background: '#ffffff'
      });
    };

    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Квантование цветов (упрощённый Median Cut)
 */
function quantizeColors(data, colorCount) {
  const pixelCount = data.length / 4;
  const pixels = [];

  // Собираем все пиксели
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Пропускаем полностью прозрачные
    if (a < 128) continue;
    
    pixels.push({ r, g, b });
  }

  if (pixels.length === 0) return ['#ffffff'];

  // Упрощаем: находим наиболее частые цвета
  const colorMap = new Map();
  pixels.forEach(p => {
    // Квантуем до 32 уровней на канал для группировки похожих цветов
    const qr = Math.round(p.r / 32) * 32;
    const qg = Math.round(p.g / 32) * 32;
    const qb = Math.round(p.b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  });

  // Сортируем по частоте
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount);

  return sortedColors.map(([key]) => {
    const [r, g, b] = key.split(',').map(Number);
    return rgbToHex(r, g, b);
  });
}

/**
 * Определение фонового цвета
 */
function detectBackgroundColor(data, width, height) {
  // Анализируем пиксели по краям изображения
  const edgePixels = [];
  const margin = 10;

  for (let x = 0; x < width; x++) {
    // Верхний край
    const topIdx = (x * 4);
    edgePixels.push({ r: data[topIdx], g: data[topIdx + 1], b: data[topIdx + 2] });
    
    // Нижний край
    const bottomIdx = ((height - 1) * width + x) * 4;
    edgePixels.push({ r: data[bottomIdx], g: data[bottomIdx + 1], b: data[bottomIdx + 2] });
  }

  for (let y = 0; y < height; y++) {
    // Левый край
    const leftIdx = (y * width) * 4;
    edgePixels.push({ r: data[leftIdx], g: data[leftIdx + 1], b: data[leftIdx + 2] });
    
    // Правый край
    const rightIdx = (y * width + width - 1) * 4;
    edgePixels.push({ r: data[rightIdx], g: data[rightIdx + 1], b: data[rightIdx + 2] });
  }

  // Находим наиболее частый цвет на краях
  const colorCount = new Map();
  edgePixels.forEach(p => {
    const key = `${Math.round(p.r / 16) * 16},${Math.round(p.g / 16) * 16},${Math.round(p.b / 16) * 16}`;
    colorCount.set(key, (colorCount.get(key) || 0) + 1);
  });

  const mostCommon = Array.from(colorCount.entries())
    .sort((a, b) => b[1] - a[1])[0];

  if (!mostCommon) return '#ffffff';

  const [r, g, b] = mostCommon[0].split(',').map(Number);
  return rgbToHex(r, g, b);
}

/**
 * Конвертация RGB в HEX
 */
function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Анализ структуры изображения (поиск областей)
 * @param {File} imageFile - Файл изображения
 * @returns {Promise<{width: number, height: number, regions: Array}>}
 */
export async function detectLayout(imageFile) {
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
      
      // 2. Применение порога для поиска границ
      const thresholded = applyThreshold(grayscale, 128);
      
      // 3. Поиск прямоугольных областей
      const regions = findRectangularRegions(thresholded, canvas.width, canvas.height);
      
      resolve({
        width: canvas.width,
        height: canvas.height,
        regions
      });
    };

    img.onerror = () => {
      resolve({ width: 0, height: 0, regions: [] });
    };

    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Конвертация в оттенки серого
 */
function toGrayscale(data) {
  const grayscale = new Uint8Array(data.length / 4);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Формула яркости по ITU-R BT.601
    grayscale[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  return grayscale;
}

/**
 * Применение порога
 */
function applyThreshold(grayscale, threshold) {
  return grayscale.map(v => v > threshold ? 255 : 0);
}

/**
 * Поиск прямоугольных областей
 */
function findRectangularRegions(thresholded, width, height) {
  const regions = [];
  const visited = new Uint8Array(thresholded.length);
  
  // Простой алгоритм поиска связанных областей
  const minRegionSize = 1000; // Минимальный размер области
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      
      if (thresholded[idx] === 0 && visited[idx] === 0) {
        // Нашли новую область - ищем её границы
        const region = findRegionBounds(thresholded, visited, x, y, width, height);
        
        if (region.width * region.height >= minRegionSize) {
          regions.push(region);
        }
      }
    }
  }
  
  // Сортируем по площади (большие сначала)
  regions.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  return regions.map((r, i) => ({
    id: i,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    area: r.width * r.height
  }));
}

/**
 * Поиск границ области через flood fill
 */
function findRegionBounds(thresholded, visited, startX, startY, width, height) {
  const stack = [[startX, startY]];
  let minX = startX, maxX = startX;
  let minY = startY, maxY = startY;
  
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * width + x;
    
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited[idx] === 1) continue;
    if (thresholded[idx] !== 0) continue;
    
    visited[idx] = 1;
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

export default {
  detectText,
  detectColors,
  detectLayout
};
