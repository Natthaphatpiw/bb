'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

  // Calculate mock High/Low based on current price
  const mockHigh = data.price * 1.05;
  const mockLow = data.price * 0.95;

  return (
    <Link href={`/markets/${data.symbol}`} className="block">
      <div
        className={`group relative bg-white border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-2xl hover:border-primary-400 hover:-translate-y-2 transition-all duration-300 overflow-hidden ${inter.className}`}
        onClick={handleClick}
      >
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-accent-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Price change flash effect */}
        {animatePrice && (
          <div className={`absolute inset-0 ${direction === 'up' ? 'bg-success-100' : 'bg-danger-100'} opacity-30 animate-flash`}></div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {data.name}
              </h3>
              {direction === 'up' && <ArrowUpRight className="w-4 h-4 text-success-600" />}
              {direction === 'down' && <ArrowDownRight className="w-4 h-4 text-danger-600" />}
            </div>
            <p className="text-xs font-semibold text-gray-500">{data.symbol}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
            direction === 'up' ? 'bg-success-100 text-success-700' :
            direction === 'down' ? 'bg-danger-100 text-danger-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {data.category || data.currency}
          </div>
        </div>

        {/* Price with real-time indicator */}
        <div className="relative z-10 mb-2">
          <div className={`text-3xl font-bold tracking-tight text-gray-900 transition-all duration-300 ${
            animatePrice ? 'scale-105' : ''
          }`}>
            {formatCurrency(data.price, data.currency)}
          </div>
        </div>

        {/* Change */}
        <div className={`flex items-center gap-2 mb-4 relative z-10`}>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-sm ${
            direction === 'up' ? 'bg-success-100 text-success-700' :
            direction === 'down' ? 'bg-danger-100 text-danger-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {getChangeIcon()}
            <span>{formatPercentage(data.changePercent)}</span>
          </div>
          <span className={`text-sm font-semibold ${getChangeColor()}`}>
            {data.change >= 0 ? '+' : ''}{formatCurrency(data.change, data.currency)}
          </span>
        </div>

        {/* High/Low Info - NEW */}
        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">High</div>
            <div className="text-sm font-bold text-success-700">{formatCurrency(mockHigh, data.currency)}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Low</div>
            <div className="text-sm font-bold text-danger-700">{formatCurrency(mockLow, data.currency)}</div>
          </div>
        </div>

        {/* Sparkline Chart - Interactive hint */}
        <div className="h-10 flex items-end mb-3 relative z-10 group/chart">
          <svg width="100%" height="40" className="w-full cursor-pointer">
            <defs>
              <linearGradient id={`gradient-${data.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={direction === 'up' ? '#059669' : direction === 'down' ? '#DC2626' : '#6B7280'} stopOpacity="0.4"/>
                <stop offset="100%" stopColor={direction === 'up' ? '#059669' : direction === 'down' ? '#DC2626' : '#6B7280'} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d={generateSparklinePoints()}
              fill={`url(#gradient-${data.symbol})`}
              stroke={direction === 'up' ? '#059669' : direction === 'down' ? '#DC2626' : '#6B7280'}
              strokeWidth="2.5"
              className="drop-shadow-sm transition-all group-hover/chart:stroke-[3]"
            />
          </svg>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/chart:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Click to view details
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-500">Vol:</span>
            <span className="font-bold text-gray-900">{data.volume && data.volume !== '0' ? formatCurrency(data.volume, '', 0, 0) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-700">
              {data.lastUpdate || data.lastUpdated ? new Date(data.lastUpdate || data.lastUpdated!).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) : 'Live'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}