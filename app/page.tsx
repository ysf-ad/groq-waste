'use client';

import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ClassificationResult from '../components/ClassificationResult';

interface ClassificationResult {
  waste_item: string;
  waste_category: string;
  instructions: string[];
  confidence: string;
  reasoning: string;
  inference_time_ms: number;
  total_time_ms: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Start timing the total round trip
    const startTime = Date.now();

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extract the base64 part (remove data:image/...;base64, prefix)
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Determine image type
      const imageType = file.type || 'image/jpeg';

      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Image,
          imageType: imageType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Classification failed');
      }

      const classificationResult = await response.json();
      
      // Calculate total round trip time
      const endTime = Date.now();
      const totalTimeMs = endTime - startTime;
      
      // Add total time to the result
      const resultWithTiming = {
        ...classificationResult,
        total_time_ms: totalTimeMs
      };
      
      console.log(`⏱️ Total round trip time: ${totalTimeMs}ms`);
      console.log(`🤖 AI inference time: ${classificationResult.inference_time_ms}ms`);
      console.log(`🌐 Network + processing overhead: ${totalTimeMs - classificationResult.inference_time_ms}ms`);
      
      setResult(resultWithTiming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Waste Classifier
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Demo using llama-4-scout-17b-16e-instruct via groq for waste classification using actual waste-wizard.csv data
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <ImageUpload 
            onImageUpload={handleImageUpload} 
            isLoading={isLoading}
          />
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <ClassificationResult 
            result={result}
            error={error}
            isLoading={isLoading}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a 
              href="https://groq.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              Groq
            </a>
            {' '}• Classification based on waste-wizard.csv data
          </p>
        </div>
      </div>
    </main>
  );
} 