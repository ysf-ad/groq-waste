import * as fs from 'fs';
import * as path from 'path';

// Simple CSV parser that handles quoted strings
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
}

export interface WasteItem {
  item: string;
  instruction_1: string;
  instruction_2: string;
  instruction_3: string;
  category: string;
}

export function getWasteCategories(): string[] {
  try {
    const { categories } = getWasteData();
    return categories;
  } catch (error) {
    console.error('❌ Error reading waste-wizard.csv:', error);
    console.log('⚠️ Using fallback categories instead');
    return [
      'plastic bottles',
      'aluminum cans', 
      'glass bottles',
      'cardboard',
      'paper',
      'food waste',
      'electronic waste',
      'batteries',
      'clothing',
      'furniture'
    ];
  }
}

export function getWasteData(): { categories: string[], items: WasteItem[] } {
  try {
    // Read the CSV file from the current directory (waste-classifier/)
    const csvPath = path.join(process.cwd(), 'waste-wizard.csv');
    console.log('📁 Attempting to read CSV from:', csvPath);
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('✅ CSV file read successfully. Length:', csvContent.length, 'characters');
    
    // Parse CSV and extract all data
    const lines = csvContent.split('\n');
    console.log('📄 Total lines in CSV:', lines.length);
    
    const categories = new Set<string>();
    const items: WasteItem[] = [];
    
    // Skip header row and process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Use proper CSV parsing instead of simple split
        const columns = parseCSVLine(line);
        if (columns.length >= 5) {
          const item = columns[0]?.trim().replace(/"/g, '') || '';
          const instruction_1 = columns[1]?.trim().replace(/"/g, '') || '';
          const instruction_2 = columns[2]?.trim().replace(/"/g, '') || '';
          const instruction_3 = columns[3]?.trim().replace(/"/g, '') || '';
          const category = columns[4]?.trim().replace(/"/g, '') || '';
          
          if (item && category) {
            categories.add(category.toLowerCase());
            items.push({
              item,
              instruction_1,
              instruction_2,
              instruction_3,
              category: category.toLowerCase()
            });
          }
        }
      }
    }
    
    const finalCategories = Array.from(categories).sort();
    console.log('🗂️ Extracted', finalCategories.length, 'unique categories from CSV');
    console.log('📦 Extracted', items.length, 'items from CSV');
    console.log('📋 First 10 categories:', finalCategories.slice(0, 10));
    
    return { categories: finalCategories, items };
  } catch (error) {
    console.error('❌ Error reading waste-wizard.csv:', error);
    console.log('⚠️ Using fallback data instead');
    throw error;
  }
} 