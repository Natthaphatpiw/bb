'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency, formatPercentage, getPriceChangeDirection } from '@/lib/utils';
import { MarketData, SortDirection } from '@/lib/types';
import Link from 'next/link';
import { Sarabun } from 'next/font/google';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

interface MarketTableProps {
  data: MarketData[];
  onRowClick?: (symbol: string) => void;
}

type SortableColumn = keyof Pick<MarketData, 'name' | 'price' | 'change' | 'changePercent' | 'volume'>;

export default function MarketTable({ data, onRowClick }: MarketTableProps) {
  const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const SortableHeader = ({ 
    column, 
    children 
  }: { 
    column: SortableColumn;
    children: React.ReactNode;
  }) => (
    <th 
      className="px-4 py-3 text-left font-semibold text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={`w-3 h-3 ${
              sortColumn === column && sortDirection === 'asc' 
                ? 'text-blue-600' 
                : 'text-gray-400'
            }`}
          />
          <ChevronDown 
            className={`w-3 h-3 -mt-1 ${
              sortColumn === column && sortDirection === 'desc' 
                ? 'text-blue-600' 
                : 'text-gray-400'
            }`}
          />
        </div>
      </div>
    </th>
  );

  const getPriceChangeColor = (change: number) => {
    const direction = getPriceChangeDirection(change);
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-sm overflow-hidden ${inter.className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full ${inter.className}`}>
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader column="name">Name</SortableHeader>
              <SortableHeader column="price">Value</SortableHeader>
              <SortableHeader column="change">Change</SortableHeader>
              <SortableHeader column="changePercent">% Change</SortableHeader>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">1 Month</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">1 Year</th>
              <SortableHeader column="volume">Volume</SortableHeader>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Time (EDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((market) => (
              <tr
                key={market.symbol}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${inter.className}`}
                onClick={() => onRowClick?.(market.symbol)}
              >
                <td className="px-4 py-3">
                  <Link href={`/markets/${market.symbol}`} className="block">
                    <div>
                      <div className="font-medium text-gray-900">{market.name}</div>
                      <div className="text-sm text-gray-500">{market.symbol}</div>
                    </div>
                  </Link>
                </td>
                
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(market.price, market.currency)}
                  </span>
                </td>
                
                <td className="px-4 py-3">
                  <span className={getPriceChangeColor(market.change)}>
                    {market.change >= 0 ? '+' : ''}{formatCurrency(market.change, market.currency)}
                  </span>
                </td>
                
                <td className="px-4 py-3">
                  <span className={getPriceChangeColor(market.change)}>
                    {formatPercentage(market.changePercent)}
                  </span>
                </td>
                
                {/* Placeholder for 1 Month data */}
                <td className="px-4 py-3">
                  <span className="text-green-600">
                    +{(Math.random() * 5).toFixed(2)}%
                  </span>
                </td>
                
                {/* Placeholder for 1 Year data */}
                <td className="px-4 py-3">
                  <span className="text-green-600">
                    +{(Math.random() * 15 + 5).toFixed(2)}%
                  </span>
                </td>
                
                <td className="px-4 py-3">
                  <span className="text-gray-900">
                    {market.volume ? formatCurrency(market.volume, '', 0, 0) : '--'}
                  </span>
                </td>
                
                <td className="px-4 py-3">
                  <span className="text-gray-600 text-sm">
                    {market.lastUpdated 
                      ? new Date(market.lastUpdated).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                      : '--'
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className={`bg-gray-50 px-4 py-3 border-t border-gray-200 ${inter.className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {sortedData.length} assets
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })} EDT
          </div>
        </div>
      </div>
    </div>
  );
}