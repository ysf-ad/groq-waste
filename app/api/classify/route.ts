import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { getWasteData, WasteItem } from '../../../lib/waste-categories';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { imageData, imageType } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Get waste data from CSV using our proper parser
    console.log('🔍 Loading waste data for classification...');
    const { categories: wasteCategories, items: wasteItems } = getWasteData();
    console.log('✅ Loaded', wasteCategories.length, 'categories and', wasteItems.length, 'items for AI classification');
    console.log('📋 Categories being used:', wasteCategories.join(', '));
    
    // Create a list of items for the LLM prompt
    const itemsList = wasteItems.slice(0, 200).map(item => item.item).join(', '); // Limit to avoid token limit

    const prompt = `You are an expert waste classification model.
Your task is to analyze a given image and find the closest matching item from the waste management database.

Find the EXACT item name that best matches what you see in the image from this list of waste items:

${itemsList}

Your answer must follow the JSON schema below and use the EXACT item name from the list above:

JSON Response Schema:
{
  "type": "object",
  "properties": {
    "matched_item": {
      "type": "string",
      "description": "The EXACT item name from the provided list that best matches the image"
    },
    "confidence": {
      "type": "string",
      "description": "Your confidence level: 'high', 'medium', or 'low'"
    },
    "reasoning": {
      "type": "string",
      "description": "Brief explanation of why this item was selected"
    }
  },
  "required": ["matched_item", "confidence", "reasoning"],
  "additionalProperties": false
}

Analyze this image and find the closest matching waste item from the database:`;

    // Start timing the AI inference
    const inferenceStartTime = Date.now();
    console.log('🤖 Starting AI inference...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageType};base64,${imageData}`,
              },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    
    // Calculate AI inference time
    const inferenceEndTime = Date.now();
    const inferenceTimeMs = inferenceEndTime - inferenceStartTime;
    console.log(`⏱️ AI inference completed in ${inferenceTimeMs}ms`);
    
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }

    try {
      const aiResponse = JSON.parse(responseContent);
      console.log('🤖 AI Response:', aiResponse);
      
      // Find the matched item in our database
      const matchedItem = wasteItems.find(item => 
        item.item.toLowerCase() === aiResponse.matched_item?.toLowerCase()
      );
      
      if (!matchedItem) {
        console.log('⚠️ No exact match found for:', aiResponse.matched_item);
        return NextResponse.json({
          error: 'Item not found in waste database',
          suggested_item: aiResponse.matched_item
        }, { status: 404 });
      }
      
      // Prepare instructions array, filtering out empty ones
      const instructions = [
        matchedItem.instruction_1,
        matchedItem.instruction_2,
        matchedItem.instruction_3
      ].filter(instruction => instruction && instruction.trim() !== '');
      
      console.log('✅ Found exact match:', matchedItem.item);
      
      const finalResponse = {
        waste_item: matchedItem.item,
        waste_category: matchedItem.category,
        instructions: instructions,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
        inference_time_ms: inferenceTimeMs
      };
      
      return NextResponse.json(finalResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI model' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 