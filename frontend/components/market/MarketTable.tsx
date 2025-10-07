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
      className="px-5 py-4 text-left font-bold text-sm text-gray-700 cursor-pointer hover:text-primary-600 hover:bg-primary-50 transition-all select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUp
            className={`w-3.5 h-3.5 transition-colors ${
              sortColumn === column && sortDirection === 'asc'
                ? 'text-accent-600'
                : 'text-gray-400'
            }`}
          />
          <ChevronDown
            className={`w-3.5 h-3.5 -mt-1 transition-colors ${
              sortColumn === column && sortDirection === 'desc'
                ? 'text-accent-600'
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
        return 'text-success-600 font-bold';
      case 'down':
        return 'text-danger-600 font-bold';
      default:
        return 'text-gray-600 font-semibold';
    }
  };

  const getPriceChangeBg = (change: number) => {
    const direction = getPriceChangeDirection(change);
    switch (direction) {
      case 'up':
        return 'bg-success-50';
      case 'down':
        return 'bg-danger-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-soft ${inter.className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full ${inter.className}`}>
          <thead className="bg-gradient-to-r from-primary-50 to-primary-100/50 border-b-2 border-primary-200">
            <tr>
              <SortableHeader column="name">Name</SortableHeader>
              <SortableHeader column="price">Value</SortableHeader>
              <SortableHeader column="change">Change</SortableHeader>
              <SortableHeader column="changePercent">% Change</SortableHeader>
              <th className="px-5 py-4 text-left font-bold text-sm text-gray-700">1 Month</th>
              <th className="px-5 py-4 text-left font-bold text-sm text-gray-700">1 Year</th>
              <SortableHeader column="volume">Volume</SortableHeader>
              <th className="px-5 py-4 text-left font-bold text-sm text-gray-700">Time (EDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {sortedData.map((market, index) => (
              <tr
                key={market.symbol}
                className={`hover:bg-primary-50/30 cursor-pointer transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} ${inter.className}`}
                onClick={() => onRowClick?.(market.symbol)}
              >
                <td className="px-5 py-4">
                  <Link href={`/markets/${market.symbol}`} className="block">
                    <div>
                      <div className="font-bold text-gray-900 text-base">{market.name}</div>
                      <div className="text-sm font-medium text-gray-500 mt-0.5">{market.symbol}</div>
                    </div>
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <span className="font-bold text-gray-900 text-base">
                    {formatCurrency(market.price, market.currency)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${getPriceChangeBg(market.change)}`}>
                    <span className={getPriceChangeColor(market.change)}>
                      {market.change >= 0 ? '+' : ''}{formatCurrency(market.change, market.currency)}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${getPriceChangeBg(market.change)}`}>
                    <span className={getPriceChangeColor(market.change)}>
                      {formatPercentage(market.changePercent)}
                    </span>
                  </div>
                </td>

                {/* Placeholder for 1 Month data */}
                <td className="px-5 py-4">
                  <span className="text-success-600 font-bold">
                    +{(Math.random() * 5).toFixed(2)}%
                  </span>
                </td>

                {/* Placeholder for 1 Year data */}
                <td className="px-5 py-4">
                  <span className="text-success-600 font-bold">
                    +{(Math.random() * 15 + 5).toFixed(2)}%
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="text-gray-900 font-semibold">
                    {market.volume ? formatCurrency(market.volume, '', 0, 0) : '--'}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="text-gray-600 text-sm font-medium">
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
      <div className={`bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-t-2 border-gray-200 ${inter.className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-gray-700">
            Showing {sortedData.length} assets
          </div>
          <div className="text-sm font-medium text-gray-600">
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