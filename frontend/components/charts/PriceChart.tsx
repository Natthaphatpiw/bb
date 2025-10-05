'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint, TimeRange } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Sarabun } from 'next/font/google';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

interface PriceChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currency: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  showNews?: boolean;
  onNewsToggle?: (enabled: boolean) => void;
}

const TIME_RANGES: TimeRange[] = ['1D', '1M', '6M', '1Y', '5Y'];

export default function PriceChart({
  data,
  currency,
  timeRange,
  onTimeRangeChange,
  showNews = false,
  onNewsToggle,
}: PriceChartProps) {
  const [newsEnabled, setNewsEnabled] = useState(false);

  const handleNewsToggle = () => {
    const newValue = !newsEnabled;
    setNewsEnabled(newValue);
    if (onNewsToggle) {
      onNewsToggle(newValue);
    }
  };

  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600 mb-1">
            {formatDateTime(label, { includeTime: true, includeSeconds: false })}
          </p>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(data.value, currency)}
          </p>
          {data.payload.volume && (
            <p className="text-sm text-gray-600">
              Volume: {data.payload.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate price range for Y-axis
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.05; // 5% padding

  return (
    <div className={`chart-container ${inter.className}`}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-6">
        {/* Time Range Buttons */}
        <div className="flex space-x-1">
          {TIME_RANGES.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange(range)}
              className="min-w-[3rem]"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* News Toggle */}
        {showNews && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">News</span>
            <button
              onClick={handleNewsToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                newsEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={newsEnabled}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  newsEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (timeRange === '1D') {
                  return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                } else {
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                }
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => formatCurrency(value, currency, 2, 2)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                stroke: '#2563eb',
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />
            
            {/* News markers (if enabled) */}
            {newsEnabled && (
              <Line
                type="monotone"
                dataKey="newsMarker"
                stroke="transparent"
                dot={{
                  fill: '#ef4444',
                  strokeWidth: 0,
                  r: 3,
                }}
                activeDot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {data.length} data points over {timeRange.toLowerCase()} period
      </div>
    </div>
  );
}