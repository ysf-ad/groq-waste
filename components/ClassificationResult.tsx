'use client';

import React from 'react';

interface ClassificationResult {
  waste_item: string;
  waste_category: string;
  instructions: string[];
  confidence: string;
  reasoning: string;
  inference_time_ms: number;
  total_time_ms?: number;
}

interface ClassificationResultProps {
  result: ClassificationResult | null;
  error: string | null;
  isLoading: boolean;
}

export default function ClassificationResult({ result, error, isLoading }: ClassificationResultProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analyzing image with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Classification Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Classification Result</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-1">Waste Item</dt>
            <dd className="text-lg font-semibold text-gray-900">{result.waste_item}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-1">Waste Category</dt>
            <dd className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 uppercase">
              {result.waste_category}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 mb-1">Disposal Instructions</dt>
            <dd className="space-y-2">
              {result.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{instruction}</span>
                </div>
              ))}
            </dd>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Confidence</dt>
              <dd className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                result.confidence === 'high' ? 'bg-green-100 text-green-800' :
                result.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {result.confidence}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">AI Reasoning</dt>
              <dd className="text-xs text-gray-600">{result.reasoning}</dd>
            </div>
          </div>

          {/* Timing Information */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <dt className="text-xs font-medium text-gray-500 mb-1">AI Inference</dt>
              <dd className="text-lg font-semibold text-blue-600">
                {result.inference_time_ms}ms
              </dd>
            </div>
            
            {result.total_time_ms && (
              <div className="text-center">
                <dt className="text-xs font-medium text-gray-500 mb-1">Total Time</dt>
                <dd className="text-lg font-semibold text-green-600">
                  {result.total_time_ms}ms
                </dd>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500 py-8">
      <p>Upload an image to get started with AI-powered waste classification</p>
    </div>
  );
} 