// Mock food database for AI macro extraction, including local/Indian foods
const FOOD_DATABASE = {
  'sambar rice': { calories: 350, protein: 8, carbs: 65, fats: 6, fiber: 5, sodium: 600 },
  'chicken curry': { calories: 380, protein: 30, carbs: 10, fats: 24, fiber: 2, sodium: 800 },
  'banana': { calories: 105, protein: 1, carbs: 27, fats: 0.3, fiber: 3, sodium: 1 },
  'sandwich': { calories: 320, protein: 12, carbs: 35, fats: 12, fiber: 4, sodium: 650 },
  'chapati': { calories: 120, protein: 3.5, carbs: 22, fats: 2, fiber: 2.5, sodium: 150 },
  'roti': { calories: 120, protein: 3.5, carbs: 22, fats: 2, fiber: 2.5, sodium: 150 },
  'idli': { calories: 150, protein: 4, carbs: 30, fats: 0.5, fiber: 2, sodium: 250 },
  'dosa': { calories: 250, protein: 5, carbs: 45, fats: 5, fiber: 1.5, sodium: 350 },
  'biryani': { calories: 550, protein: 22, carbs: 75, fats: 18, fiber: 3.5, sodium: 950 },
  'salad': { calories: 120, protein: 2, carbs: 8, fats: 9, fiber: 3, sodium: 220 },
  'pizza': { calories: 285, protein: 12, carbs: 36, fats: 10, fiber: 2.5, sodium: 640 },
  'apple': { calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4.4, sodium: 2 },
  'rice': { calories: 205, protein: 4, carbs: 45, fats: 0.4, fiber: 0.6, sodium: 5 },
  'dal': { calories: 150, protein: 8, carbs: 24, fats: 2.5, fiber: 6, sodium: 400 },
  'egg': { calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, fiber: 0, sodium: 62 },
  'coffee': { calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 5 }
};

/**
 * Parses unstructured text into structured wellness data.
 * Returns an extraction summary containing categories like sleep, caffeine, shift, and nutrition.
 */
function parseWellnessText(text) {
  const result = {
    sleep: null,
    caffeine: null,
    shift: null,
    nutrition: []
  };

  const normalized = text.toLowerCase();

  // 1. Sleep Parsing
  // Matches: "slept 6 hours", "slept only 5 hrs", "sleep = 7h", "6.5 hours of sleep"
  const sleepRegex = /(?:slept|sleep)\s*(?:for|only)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\b|(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\s*(?:of\s*)?sleep/i;
  const sleepMatch = normalized.match(sleepRegex);
  if (sleepMatch) {
    const hours = parseFloat(sleepMatch[1] || sleepMatch[2]);
    // Sleep quality keyword mapping
    let quality = 'Good';
    if (normalized.includes('bad') || normalized.includes('poor') || normalized.includes('terrible') || normalized.includes('woke up twice') || normalized.includes('interrupted')) {
      quality = 'Poor';
    } else if (normalized.includes('okay') || normalized.includes('decent') || normalized.includes('fair') || normalized.includes('restless')) {
      quality = 'Fair';
    } else if (normalized.includes('excellent') || normalized.includes('amazing') || normalized.includes('great') || normalized.includes('deep')) {
      quality = 'Excellent';
    }

    result.sleep = {
      duration: hours,
      quality,
      wakeUps: normalized.includes('woke up once') ? 1 : (normalized.includes('woke up twice') ? 2 : (normalized.includes('woke up') ? 2 : 0))
    };
  }

  // 2. Caffeine Parsing
  // Matches: "had 3 coffees", "drank 2 espressos", "caffeine: 200mg", "4 cups of tea"
  const caffeineRegex = /(?:had|drank|have|consumed)?\s*(\d+)\s*(?:cups?|glasses|shots)?\s*(?:of\s*)?(coffees?|espressos?|energy\s*drinks?|teas?|monsters?|red\s*bulls?)/i;
  const caffeineMatch = normalized.match(caffeineRegex);
  if (caffeineMatch) {
    const count = parseInt(caffeineMatch[1], 10);
    const beverageName = caffeineMatch[2];
    let beverage = 'Filter Coffee';
    let mgAmount = 95;

    if (beverageName.includes('espresso')) {
      beverage = 'Espresso';
      mgAmount = 75;
    } else if (beverageName.includes('energy') || beverageName.includes('monster') || beverageName.includes('bull')) {
      beverage = 'Energy Drink';
      mgAmount = 80;
    } else if (beverageName.includes('tea')) {
      beverage = 'Tea';
      mgAmount = 30;
    }

    result.caffeine = {
      beverage,
      count,
      mgAmount: mgAmount * count
    };
  } else {
    // Look for direct mg logging: e.g. "200mg caffeine" or "100 mg of caffeine"
    const directMgRegex = /(\d+)\s*(?:mg|milligrams)\s*(?:of\s*)?caffeine/i;
    const directMgMatch = normalized.match(directMgRegex);
    if (directMgMatch) {
      result.caffeine = {
        beverage: 'Caffeine Pill/Direct',
        count: 1,
        mgAmount: parseInt(directMgMatch[1], 10)
      };
    }
  }

  // 3. Shift Parsing
  // Matches: "finished a 12 hour night shift", "worked 8h day shift", "10 hour on call duty"
  const shiftRegex = /(?:worked|finished|had)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\s*(night|day|on-call|on\s*call|rotating)?\s*shift/i;
  const shiftMatch = normalized.match(shiftRegex);
  if (shiftMatch) {
    const hours = parseFloat(shiftMatch[1]);
    let shiftType = 'Day';
    const typeStr = shiftMatch[2] || '';
    
    if (typeStr.includes('night') || normalized.includes('night shift') || normalized.includes('overnight')) {
      shiftType = 'Night';
    } else if (typeStr.includes('on-call') || typeStr.includes('on call') || normalized.includes('on-call')) {
      shiftType = 'On-Call';
    } else if (typeStr.includes('rotating') || normalized.includes('rotating')) {
      shiftType = 'Rotating';
    }

    result.shift = {
      duration: hours,
      shiftType,
      breakDuration: normalized.includes('no break') ? 0 : (normalized.includes('30 min break') || normalized.includes('30-minute break') ? 30 : 45)
    };
  }

  // 4. Nutrition Parsing
  // Scans the normalized string against keys in the FOOD_DATABASE
  Object.keys(FOOD_DATABASE).forEach(foodKey => {
    if (normalized.includes(foodKey)) {
      // Find quantity if available before the food word, e.g. "2 chapatis", "eat a banana"
      const wordIndex = normalized.indexOf(foodKey);
      const prevSubstring = normalized.substring(Math.max(0, wordIndex - 10), wordIndex).trim();
      let multiplier = 1;
      const countMatch = prevSubstring.match(/\b(\d+)\b/);
      if (countMatch) {
        multiplier = parseInt(countMatch[1], 10);
      }

      const baseMacros = FOOD_DATABASE[foodKey];
      
      // Determine meal category
      let mealCategory = 'Lunch';
      if (normalized.includes('breakfast') || normalized.includes('morning')) {
        mealCategory = 'Breakfast';
      } else if (normalized.includes('dinner') || normalized.includes('night') || normalized.includes('supper')) {
        mealCategory = 'Dinner';
      } else if (normalized.includes('snack') || normalized.includes('tea time')) {
        mealCategory = 'Snack';
      }

      result.nutrition.push({
        mealCategory,
        foodItem: foodKey.charAt(0).toUpperCase() + foodKey.slice(1),
        calories: baseMacros.calories * multiplier,
        protein: baseMacros.protein * multiplier,
        carbs: baseMacros.carbs * multiplier,
        fats: baseMacros.fats * multiplier,
        fiber: baseMacros.fiber * multiplier,
        sodium: baseMacros.sodium * multiplier
      });
    }
  });

  return result;
}

module.exports = {
  parseWellnessText,
  FOOD_DATABASE
};
