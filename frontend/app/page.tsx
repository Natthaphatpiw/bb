'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import MarketCard from '@/components/market/MarketCard';
import MarketTable from '@/components/market/MarketTable';
import MarketImpactModal from '@/components/modal/MarketImpactModal';
import { MarketCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
import { getMarketOverview, getMarketImpactOverview } from '@/lib/api';
import { MarketData, MarketImpactOverview } from '@/lib/types';
import { getAllMarketsData, getMarketDataByKey, convertToModalData } from '@/lib/realDataApi';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { Sarabun } from 'next/font/google';


const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

export default function MarketOverview() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [impactOverview, setImpactOverview] = useState<MarketImpactOverview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        setIsLoading(true);
        setError(null);

        // ลองดึงข้อมูลจริงจาก all_markets.json ก่อน
        try {
          const allMarkets = await getAllMarketsData();

          // แปลงข้อมูลจาก backend format เป็น frontend format
          const realMarkets: MarketData[] = [];

          // Crude Oil
          if (allMarkets.data.crude_oil) {
            const co = allMarkets.data.crude_oil;
            realMarkets.push({
              symbol: 'CO',
              name: 'Crude Oil',
              marketName: co.marketNameTh,
              price: co.popup.currentPrice,
              change: co.popup.priceChange,
              changePercent: co.popup.priceChangePercent,
              volume: '0', // yfinance ไม่ให้ volume
              oneMonth: 0,
              oneYear: 0,
              lastUpdate: co.generatedAt,
              category: 'Energy'
            });
          }

          // Sugar
          if (allMarkets.data.sugar) {
            const sugar = allMarkets.data.sugar;
            realMarkets.push({
              symbol: 'SUGAR',
              name: 'Sugar',
              marketName: sugar.marketNameTh,
              price: sugar.popup.currentPrice,
              change: sugar.popup.priceChange,
              changePercent: sugar.popup.priceChangePercent,
              volume: '0',
              oneMonth: 0,
              oneYear: 0,
              lastUpdate: sugar.generatedAt,
              category: 'Agriculture'
            });
          }

          // USD/THB
          if (allMarkets.data.usd_thb) {
            const usdthb = allMarkets.data.usd_thb;
            realMarkets.push({
              symbol: 'USDTHB',
              name: 'USD/THB',
              marketName: usdthb.marketNameTh,
              price: usdthb.popup.currentPrice,
              change: usdthb.popup.priceChange,
              changePercent: usdthb.popup.priceChangePercent,
              volume: '0',
              oneMonth: 0,
              oneYear: 0,
              lastUpdate: usdthb.generatedAt,
              category: 'Currency'
            });
          }

          if (realMarkets.length > 0) {
            setMarkets(realMarkets);
            setLastUpdated(allMarkets.generatedAt);
            return; // สำเร็จแล้ว ไม่ต้องใช้ mock data
          }
        } catch (realDataErr) {
          console.log('Real data not yet available, falling back to mock data');
        }

        // ถ้าดึงข้อมูลจริงไม่ได้ ให้ใช้ mock data
        const data = await getMarketOverview();
        setMarkets(data.markets);
        setLastUpdated(data.lastUpdated);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarketData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickView = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsModalOpen(true);
    setIsLoadingModal(true);

    try {
      // แม็พ symbol เป็น market key
      let marketKey: 'crude_oil' | 'sugar' | 'usd_thb' | null = null;
      if (symbol === 'CO' || symbol === 'CL1' || symbol === 'CL=F') {
        marketKey = 'crude_oil';
      } else if (symbol === 'SUGAR' || symbol === 'SB=F') {
        marketKey = 'sugar';
      } else if (symbol === 'USDTHB' || symbol === 'THB=X') {
        marketKey = 'usd_thb';
      }

      if (marketKey) {
        // ใช้ข้อมูลจริง
        const marketData = await getMarketDataByKey(marketKey);
        const realData = convertToModalData(marketData.popup, marketData);
        setImpactOverview(realData);
      } else {
        // ใช้ mock data สำหรับสินค้าอื่นๆ
        const overview = await getMarketImpactOverview(symbol);
        setImpactOverview(overview);
      }
    } catch (err) {
      console.error('Failed to fetch impact overview:', err);
      setImpactOverview(null);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSymbol(null);
    setImpactOverview(null);
  };

  const handleMarketCardClick = (symbol: string) => {
    // Navigation handled by Link in MarketCard component
  };

  const handleTableRowClick = (symbol: string) => {
    // Navigation will be handled by Link in MarketTable component
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${inter.className}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold text-gray-900 ${inter.className}`}>Markets</h1>
          <p className={`mt-2 text-gray-600 ${inter.className}`}>
            Track commodities and currencies with real-time data and AI insights
          </p>
        </div>
        
        {lastUpdated && (
          <div className={`flex items-center text-sm text-gray-500 ${inter.className}`}>
            <Clock className="w-4 h-4 mr-2" />
            Last Updated: {formatDateTime(lastUpdated, { includeSeconds: true })}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-6 ${inter.className}`}>
          <div className="flex items-center">
            <div className="text-red-800">
              <h3 className={`font-medium ${inter.className}`}>Unable to load market data</h3>
              <p className={`mt-1 text-sm ${inter.className}`}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today in Markets Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-semibold text-gray-900 ${inter.className}`}>Today in the Markets</h2>
          <div className={`flex items-center text-sm text-gray-500 ${inter.className}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            Live Data
          </div>
        </div>

        {/* Market Cards Horizontal Scroll */}
        <div className={`overflow-x-auto custom-scrollbar ${inter.className}`}>
          <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`flex-none w-64 ${inter.className}`}>
                    <MarketCardSkeleton />
                  </div>
                ))
              : markets.map((market) => (
                  <div key={market.symbol} className={`flex-none w-64 ${inter.className}`}>
                    <MarketCard
                      data={market}
                      onClick={handleMarketCardClick}
                      onQuickView={handleQuickView}
                    />
                  </div>
                ))
            }
          </div>
        </div>

        {/* Quick Stats */}
        {!isLoading && markets.length > 0 && (
          <div className={`mt-6 bg-white border border-gray-200 rounded-lg p-4 ${inter.className}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-sm text-gray-600 ${inter.className}`}>Total Assets</div>
                <div className={`text-lg font-semibold text-gray-900 ${inter.className}`}>{markets.length}</div>
              </div>
              <div>
                <div className={`text-sm text-gray-600 ${inter.className}`}>Gainers</div>
                <div className="text-lg font-semibold text-green-600">
                  {markets.filter(m => m.change > 0).length}
                </div>
              </div>
              <div>
                <div className={`text-sm text-gray-600 ${inter.className}`}>Losers</div>
                <div className="text-lg font-semibold text-red-600">
                  {markets.filter(m => m.change < 0).length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Unchanged</div>
                <div className={`text-lg font-semibold text-gray-600 ${inter.className}`}>
                  {markets.filter(m => m.change === 0).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Market Data Table Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-semibold text-gray-900 ${inter.className}`}>Market Data</h2>
          <Link 
            href="/markets/all" 
            className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${inter.className}`}
          >
            View All Markets →
          </Link>
        </div>

        {isLoading ? (
          <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${inter.className}`}>
            <table className={`min-w-full ${inter.className}`}>
              <thead className={`bg-gray-50 ${inter.className}`}>
                <tr>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>Name</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>Value</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>Change</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>% Change</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>1 Month</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>1 Year</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>Volume</th>
                  <th className={`px-4 py-3 text-left font-semibold text-sm text-gray-600 ${inter.className}`}>Time (EDT)</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 ${inter.className}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <MarketTable 
            data={markets} 
            onRowClick={handleTableRowClick}
          />
        )}
      </section>

      {/* Footer Info */}
      <div className={`mt-12 text-center text-sm text-gray-500 ${inter.className}`}>
        <p>
          Market data provided for informational purposes only.
          <Link href="/disclaimer" className={`text-blue-600 hover:text-blue-800 ml-1 ${inter.className}`}>
            View disclaimer
          </Link>
        </p>
      </div>

      {/* Market Impact Modal */}
      {isModalOpen && impactOverview && !isLoadingModal && (
        <MarketImpactModal
          data={impactOverview}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}