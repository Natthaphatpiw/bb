'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Sarabun } from 'next/font/google';
import Link from 'next/link';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface MarketItem {
  symbol: string;
  name: string;
  type: 'currency' | 'commodity';
  price: number;
  change: number;
  currency: string;
}

const MARKET_DATA: MarketItem[] = [
  { symbol: 'CO', name: 'Crude Oil (WTI)', type: 'commodity', price: 63.46, change: 0.08, currency: 'USD' },
  { symbol: 'SB1', name: 'Sugar', type: 'commodity', price: 18.23, change: -0.15, currency: 'USD' },
  { symbol: 'HG1', name: 'Copper', type: 'commodity', price: 8450.00, change: 0.23, currency: 'USD' },
  { symbol: 'USDTHB', name: 'USD/THB', type: 'currency', price: 35.42, change: 0.05, currency: 'THB' },
  { symbol: 'EURTHB', name: 'EUR/THB', type: 'currency', price: 38.91, change: -0.12, currency: 'THB' },
  { symbol: 'CNYTHB', name: 'CNY/THB', type: 'currency', price: 4.98, change: 0.20, currency: 'THB' },
];

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({ className = '', placeholder = 'Search symbols...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'currency' | 'commodity'>('all');
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter and search results
  const filteredResults = MARKET_DATA.filter(item => {
    const matchesQuery = query === '' || 
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    
    return matchesQuery && matchesFilter;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setIsFilterOpen(false);
  };

  const handleItemClick = (symbol: string) => {
    setQuery('');
    setIsOpen(false);
    setIsFilterOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  const handleFilterSelect = (filter: 'all' | 'currency' | 'commodity') => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
    if (query) {
      setIsOpen(true);
    }
  };

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'currency': return 'Currency';
      case 'commodity': return 'Commodity';
      default: return 'All';
    }
  };

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input with Filter */}
      <div className="flex gap-2">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${sarabun.className}`}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 transition-colors text-sm ${sarabun.className}`}
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{getFilterLabel()}</span>
          </button>

          {/* Filter Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-sm shadow-lg z-50">
              <button
                onClick={() => handleFilterSelect('all')}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${sarabun.className}`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterSelect('currency')}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedFilter === 'currency' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${sarabun.className}`}
              >
                Currency
              </button>
              <button
                onClick={() => handleFilterSelect('commodity')}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedFilter === 'commodity' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${sarabun.className}`}
              >
                Commodity
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredResults.length > 0 ? (
            <div className="py-2">
              {filteredResults.map((item) => (
                <Link
                  key={item.symbol}
                  href={`/markets/${item.symbol}`}
                  onClick={() => handleItemClick(item.symbol)}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium text-gray-900 ${sarabun.className}`}>
                          {item.symbol}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          item.type === 'currency' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <div className={`text-sm text-gray-600 mt-0.5 ${sarabun.className}`}>
                        {item.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-gray-900 ${sarabun.className}`}>
                        {item.currency} {item.price.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium ${getPriceChangeColor(item.change)} ${sarabun.className}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`px-4 py-6 text-center text-gray-500 ${sarabun.className}`}>
              {query ? `No results found for "${query}"` : 'Start typing to search...'}
            </div>
          )}
          
          {/* Show result count */}
          {filteredResults.length > 0 && (
            <div className={`px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-600 ${sarabun.className}`}>
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
              {selectedFilter !== 'all' && ` in ${selectedFilter}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}