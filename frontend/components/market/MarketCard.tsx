'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercentage, getPriceChangeDirection } from '@/lib/utils';
import { MarketData } from '@/lib/types';
import Link from 'next/link';
import { Sarabun } from 'next/font/google';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

interface MarketCardProps {
  data: MarketData;
  onClick?: (symbol: string) => void;
  onQuickView?: (symbol: string) => void;
}

export default function MarketCard({ data, onClick, onQuickView }: MarketCardProps) {
  const [animatePrice, setAnimatePrice] = useState(false);
  const direction = getPriceChangeDirection(data.change);

  useEffect(() => {
    setAnimatePrice(true);
    const timer = setTimeout(() => setAnimatePrice(false), 600);
    return () => clearTimeout(timer);
  }, [data.price]);

  const handleClick = (e: React.MouseEvent) => {
    // Check if onQuickView is provided and card should open modal instead
    if (onQuickView) {
      e.preventDefault();
      onQuickView(data.symbol);
      return;
    }

    if (onClick) {
      onClick(data.symbol);
    }
  };

  const getChangeIcon = () => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Generate simple sparkline data (placeholder for now)
  const generateSparklinePoints = () => {
    // Generate sample data points for sparkline
    const points = Array.from({ length: 20 }, (_, i) => {
      const variation = (Math.random() - 0.5) * 0.1;
      return data.price * (1 + variation);
    });
    
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min;
    
    if (range === 0) return 'M0,30 L80,30';
    
    return points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * 80;
        const y = 30 - ((point - min) / range) * 20;
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

  return (
    <Link href={`/markets/${data.symbol}`} className="block">
      <div 
        className={`group bg-white border border-gray-200 rounded-sm p-4 transition-colors duration-200 hover:bg-gray-50 ${inter.className}`}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
              {data.name}
            </h3>
            <p className="text-xs text-gray-500">{data.symbol}</p>
          </div>
          <div className="text-xs text-gray-400">
            {data.currency}
          </div>
        </div>

        {/* Price */}
        <div className={`text-2xl font-semibold tracking-tight text-gray-900 mb-2 transition-all duration-300 ${
          animatePrice ? 'animate-price-flash' : ''
        }`}>
          {formatCurrency(data.price, data.currency)}
        </div>

        {/* Change */}
        <div className={`flex items-center mb-3 ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="text-sm font-medium ml-1">
            {formatPercentage(data.changePercent)}
          </span>
          <span className="text-xs ml-2 font-normal">
            ({data.change >= 0 ? '+' : ''}{formatCurrency(data.change, data.currency)})
          </span>
        </div>

        {/* Sparkline Chart */}
        <div className="h-10 flex items-end">
          <svg width="80" height="30" className="w-full">
            <path
              d={generateSparklinePoints()}
              fill="none"
              stroke={direction === 'up' ? '#10b981' : direction === 'down' ? '#ef4444' : '#6b7280'}
              strokeWidth="1.5"
              className="opacity-70"
            />
          </svg>
        </div>

        {/* Footer Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-[13px]">
          <div className="text-xs text-gray-500">
            Vol: {data.volume ? formatCurrency(data.volume, '', 0, 0) : '--'}
          </div>
          <div className="text-xs text-gray-500">
            {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '--'}
          </div>
        </div>
      </div>
    </Link>
  );
}