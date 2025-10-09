'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercentage, getPriceChangeDirection } from '@/lib/utils';
import { MarketData } from '@/lib/types';
import Link from 'next/link';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface MarketCardProps {
  data: MarketData;
  onClick?: (symbol: string) => void;
  onQuickView?: (symbol: string) => void;
  onMarketCardClick?: (symbol: string) => void;
}

export default function MarketCardModern({ data, onClick, onQuickView, onMarketCardClick }: MarketCardProps) {
  const [animatePrice, setAnimatePrice] = useState(false);
  const direction = getPriceChangeDirection(data.change);

  useEffect(() => {
    setAnimatePrice(true);
    const timer = setTimeout(() => setAnimatePrice(false), 600);
    return () => clearTimeout(timer);
  }, [data.price]);

  const handleClick = (e: React.MouseEvent) => {
    if (onQuickView) {
      e.preventDefault();
      onQuickView(data.symbol);
      return;
    }
    if (onMarketCardClick) {
      e.preventDefault();
      onMarketCardClick(data.symbol);
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

  // Use real High/Low if available
  const highPrice = data.high || data.price * 1.05;
  const lowPrice = data.low || data.price * 0.95;

  // Map symbol to correct path
  const getMarketPath = (symbol: string) => {
    const symbolMap: Record<string, string> = {
      'SB1': 'SB=F',
      'CL1': 'CL=F',
      'THB=X': 'THB=X'
    };
    return `/markets/${symbolMap[symbol] || symbol}`;
  };

  return (
    <Link href={getMarketPath(data.symbol)} className="block group">
      <div
        className={`relative glass-effect rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-white/40 ${sarabun.className}`}
        onClick={handleClick}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Shimmer effect on hover */}
        <div className="shimmer opacity-0 group-hover:opacity-100"></div>

        {/* Price flash animation */}
        {animatePrice && (
          <div className={`absolute inset-0 ${direction === 'up' ? 'bg-success-100' : 'bg-danger-100'} opacity-20 animate-flash`}></div>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {data.name}
              </h3>
              <p className="text-sm font-medium text-gray-500">{data.symbol}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
              direction === 'up' ? 'bg-success-100/80 text-success-700' :
              direction === 'down' ? 'bg-danger-100/80 text-danger-700' :
              'bg-gray-100/80 text-gray-700'
            }`}>
              {data.category || data.currency}
            </div>
          </div>

          {/* Price */}
          <div className={`text-3xl font-bold text-gray-900 mb-3 transition-all duration-300 ${
            animatePrice ? 'scale-105' : ''
          }`}>
            {formatCurrency(data.price, data.currency)}
          </div>

          {/* Change */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm ${
              direction === 'up' ? 'bg-success-500 text-white' :
              direction === 'down' ? 'bg-danger-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {getChangeIcon()}
              <span>{formatPercentage(data.changePercent)}</span>
            </div>
            <span className={`text-sm font-medium ${
              direction === 'up' ? 'text-success-600' :
              direction === 'down' ? 'text-danger-600' :
              'text-gray-600'
            }`}>
              {data.change >= 0 ? '+' : ''}{formatCurrency(data.change, data.currency)}
            </span>
          </div>

          {/* High/Low - Compact gradient bars */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">High</span>
              <span className="font-bold text-success-700">{formatCurrency(highPrice, data.currency)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success-400 to-success-500 rounded-full"
                style={{ width: '70%' }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Low</span>
              <span className="font-bold text-danger-700">{formatCurrency(lowPrice, data.currency)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-danger-400 to-danger-500 rounded-full"
                style={{ width: '45%' }}
              ></div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Vol:</span>
              <span className="font-semibold text-gray-900">
                {data.volume && data.volume !== '0' ? formatCurrency(data.volume, '', 0, 0) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse shadow-sm shadow-accent-500/50"></div>
              <span className="text-gray-600 font-medium">
                {data.lastUpdate || data.lastUpdated ? new Date(data.lastUpdate || data.lastUpdated!).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }) : 'Live'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
