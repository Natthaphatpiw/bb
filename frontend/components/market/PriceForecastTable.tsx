'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Forecast } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface PriceForecastTableProps {
  forecasts: Forecast[];
  currentPrice: number;
  currency: string;
}

export default function PriceForecastTable({ forecasts, currentPrice, currency }: PriceForecastTableProps) {
  const ForecastDirection = ({ direction }: { direction?: Forecast['direction'] }) => {
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

    const { icon: Icon, text, color, bg } = config[direction || 'neutral'];

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
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className={`min-w-full bg-white ${sarabun.className}`}>
        <thead className="bg-gray-50">
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${sarabun.className}`}>
              Period
            </th>
            <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${sarabun.className}`}>
              Target Price
            </th>
            <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${sarabun.className}`}>
              Expected Change
            </th>
            <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${sarabun.className}`}>
              Confidence
            </th>
            <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${sarabun.className}`}>
              Direction
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {forecasts.map((forecast, index) => {
            const changePercent = ((forecast.target - currentPrice) / currentPrice) * 100;
            const changeAmount = forecast.target - currentPrice;

            return (
              <tr key={index} className={`hover:bg-gray-50 transition-colors ${sarabun.className}`}>
                <td className={`px-4 py-3 text-sm font-medium text-gray-900 ${sarabun.className}`}>
                  {forecast.period}
                </td>
                <td className={`px-4 py-3 text-sm font-semibold text-gray-900 ${sarabun.className}`}>
                  {formatCurrency(forecast.target, currency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-col">
                    <span className={`font-medium ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'} ${sarabun.className}`}>
                      {changeAmount >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                    <span className={`text-xs text-gray-500 ${sarabun.className}`}>
                      ({changeAmount >= 0 ? '+' : ''}{formatCurrency(changeAmount, currency)})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className={`w-16 bg-gray-200 rounded-full h-2 mr-2 ${sarabun.className}`}>
                      <div
                        className={`h-2 rounded-full ${
                          forecast.confidence >= 70 ? 'bg-green-500' :
                          forecast.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${forecast.confidence}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${confidenceColor(forecast.confidence)} ${sarabun.className}`}>
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
  );
}
