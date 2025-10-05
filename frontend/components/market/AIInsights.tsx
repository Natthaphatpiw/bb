'use client';

import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AIInsight, Forecast } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { AIInsightsSkeleton } from '@/components/ui/Skeleton';
import { Sarabun } from 'next/font/google';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

interface AIInsightsProps {
  insights: AIInsight | null;
  isLoading: boolean;
  error: string | null;
  currentPrice: number;
  currency: string;
}

export default function AIInsights({ 
  insights, 
  isLoading, 
  error, 
  currentPrice, 
  currency 
}: AIInsightsProps) {
  if (isLoading) {
    return <AIInsightsSkeleton />;
  }

  if (error || !insights) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6 ${inter.className}`}>
        <div className="text-center text-gray-500">
          <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">
            {error || 'AI insights temporarily unavailable'}
          </p>
          <p className="text-xs mt-1">
            Please try refreshing the page or check back later.
          </p>
        </div>
      </div>
    );
  }

  const ForecastDirection = ({ direction }: { direction: Forecast['direction'] }) => {
    const config = {
      bullish: {
        icon: TrendingUp,
        text: 'Bullish',
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      bearish: {
        icon: TrendingDown,
        text: 'Bearish',
        color: 'text-red-600',
        bg: 'bg-red-50',
      },
      neutral: {
        icon: Minus,
        text: 'Neutral',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
      },
    };

    const { icon: Icon, text, color, bg } = config[direction];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color} ${bg}`}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </span>
    );
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-sm p-6 mt-6 ${inter.className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI-Powered Insights & Forecast
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          Confidence: <span className={`font-medium ${confidenceColor(insights.confidence * 100)}`}>
            {Math.round(insights.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Market Summary */}
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-900 mb-3">
          Market Summary:
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {insights.summary}
        </p>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-900 mb-3">
          Key Insights:
        </h4>
        <ul className="space-y-2">
          {insights.keyInsights.map((insight, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <span className="text-blue-600 mr-2 mt-0.5 font-bold">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Forecast Table */}
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-3">
          Price Forecast:
        </h4>
        
        <div className="overflow-hidden rounded-sm border border-gray-200">
          <table className={`min-w-full bg-white ${inter.className}`}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Target Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expected Change
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Direction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {insights.forecasts.map((forecast, index) => {
                const changePercent = ((forecast.target - currentPrice) / currentPrice) * 100;
                const changeAmount = forecast.target - currentPrice;
                
                return (
                  <tr key={index} className={`hover:bg-gray-50 transition-colors ${inter.className}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {forecast.period}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(forecast.target, currency)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className={`font-medium ${
                          changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {changeAmount >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({changeAmount >= 0 ? '+' : ''}{formatCurrency(changeAmount, currency)})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div className={`w-16 bg-gray-200 rounded-full h-2 mr-2 ${inter.className}`}>
                          <div
                            className={`h-2 rounded-full ${
                              forecast.confidence >= 70 ? 'bg-green-500' :
                              forecast.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${forecast.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${confidenceColor(forecast.confidence)}`}>
                          {forecast.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <ForecastDirection direction={forecast.direction} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Generated: {new Date(insights.generatedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
          <span>
            Next update: {new Date(insights.expiresAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>
            ⚠️ Forecasts are AI-generated predictions and should not be considered as financial advice. 
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}