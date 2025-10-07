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
        className={`group relative bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200 rounded-xl p-5 shadow-soft hover:shadow-hard hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${inter.className}`}
        onClick={handleClick}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
              {data.name}
            </h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{data.symbol}</p>
          </div>
          <div className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-md">
            {data.currency}
          </div>
        </div>

        {/* Price */}
        <div className={`text-3xl font-bold tracking-tight text-gray-900 mb-3 relative z-10 transition-all duration-300 ${
          animatePrice ? 'animate-price-flash' : ''
        }`}>
          {formatCurrency(data.price, data.currency)}
        </div>

        {/* Change */}
        <div className={`flex items-center mb-4 relative z-10 ${getChangeColor()}`}>
          <div className={`p-1.5 rounded-lg ${direction === 'up' ? 'bg-success-100' : direction === 'down' ? 'bg-danger-100' : 'bg-gray-100'}`}>
            {getChangeIcon()}
          </div>
          <span className="text-base font-bold ml-2">
            {formatPercentage(data.changePercent)}
          </span>
          <span className="text-xs ml-2 font-semibold opacity-75">
            ({data.change >= 0 ? '+' : ''}{formatCurrency(data.change, data.currency)})
          </span>
        </div>

        {/* Sparkline Chart */}
        <div className="h-12 flex items-end mb-4 relative z-10">
          <svg width="100%" height="48" className="w-full">
            <defs>
              <linearGradient id={`gradient-${data.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={direction === 'up' ? '#059669' : direction === 'down' ? '#DC2626' : '#6B7280'} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={direction === 'up' ? '#059669' : direction === 'down' ? '#DC2626' : '#6B7280'} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d={generateSparklinePoints()}
              fill={`url(#gradient-${data.symbol})`}
              stroke={direction === 'up' ? '#059669' : direction === 'down' ? '#DC2626' : '#6B7280'}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          </svg>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-center text-xs relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Vol:</span>
            <span className="font-bold text-gray-900">{data.volume ? formatCurrency(data.volume, '', 0, 0) : '--'}</span>
          </div>
          <div className="font-medium text-gray-500">
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