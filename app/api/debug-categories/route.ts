import { getWasteCategories } from '../../../lib/waste-categories';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Debug endpoint called - loading categories...');
    const categories = getWasteCategories();
    
    return NextResponse.json({
      success: true,
      totalCategories: categories.length,
      categories: categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 