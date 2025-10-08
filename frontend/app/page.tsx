'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import MarketCardModern from '@/components/market/MarketCardModern';
import MarketDetailModalV2 from '@/components/modal/MarketDetailModalV2';
import LatestNewsSection from '@/components/news/LatestNewsSection';
import { MarketCardSkeleton } from '@/components/ui/Skeleton';
import { getMarketOverview } from '@/lib/api';
import { MarketData } from '@/lib/types';
import { getAllMarketsData } from '@/lib/realDataApi';
import { formatDateTime } from '@/lib/utils';
import { loadMarketDetail, symbolToMarketKey, MarketDetailData, PopupData } from '@/lib/marketDataLoader';
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
  const [selectedMarketData, setSelectedMarketData] = useState<MarketDetailData | null>(null);
  const [selectedPopupData, setSelectedPopupData] = useState<PopupData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        setIsLoading(true);
        setError(null);

        // ดึงข้อมูลจริงจาก market_data.json (จาก yfinance)
        try {
          const response = await fetch('/data/market_data.json');
          const marketData = await response.json();

          if (marketData.markets && marketData.markets.length > 0) {
            // แปลงข้อมูลจาก market_data.json เป็น frontend format
            const realMarkets: MarketData[] = marketData.markets.map((market: MarketData) => ({
              symbol: market.symbol,
              name: market.name,
              marketName: market.name_th,
              price: market.price,
              change: market.change,
              changePercent: market.changePercent,
              volume: market.volume.toString(),
              high: market.high,
              low: market.low,
              open: market.open,
              oneMonth: 0, // TODO: Calculate from historical data
              oneYear: 0,  // TODO: Calculate from historical data
              lastUpdate: market.lastUpdate,
              category: market.category,
              currency: market.currency,
              unit: market.unit
            }));

            setMarkets(realMarkets);
            setLastUpdated(marketData.generatedAt);
            console.log('✅ Loaded real market data from yfinance');
            return;
          }
        } catch (realDataErr) {
          console.log('⚠️ Market data not available, trying all_markets.json...', realDataErr);
        }

        // Fallback: ลองดึงจาก all_markets.json
        try {
          const allMarkets = await getAllMarketsData();
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
              volume: '0',
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
            console.log('✅ Loaded data from all_markets.json');
            return;
          }
        } catch {
          console.log('⚠️ all_markets.json not available, using mock data');
        }

        // Last resort: ใช้ mock data
        const data = await getMarketOverview();
        setMarkets(data.markets);
        setLastUpdated(data.lastUpdated);
      } catch (err) {
        console.error('❌ Failed to fetch market data:', err);
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
    setIsModalOpen(true);
    setIsLoadingModal(true);

    try {
      const marketKey = symbolToMarketKey(symbol);
      if (!marketKey) {
        console.error('Unknown market symbol:', symbol);
        setIsLoadingModal(false);
        return;
      }

      const data = await loadMarketDetail(marketKey);
      if (data) {
        setSelectedMarketData(data.marketData);
        setSelectedPopupData(data.popupData);
      } else {
        console.error('Failed to load market detail for', marketKey);
      }
    } catch (err) {
      console.error('Error loading market detail:', err);
      setSelectedMarketData(null);
      setSelectedPopupData(null);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMarketData(null);
    setSelectedPopupData(null);
  };

  const handleMarketCardClick = () => {
    // Navigation handled by Link in MarketCard component
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${inter.className}`}>
      {/* Page Header - Improved Brand Identity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full"></div>
              <h1 className={`text-5xl font-extrabold tracking-tight ${inter.className}`}>
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                  Markets
                </span>
              </h1>
            </div>
            <p className={`text-base text-gray-600 font-medium ml-15 ${inter.className}`}>
              Real-time commodities & currencies with AI-powered insights
            </p>
          </div>

          {lastUpdated && (
            <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-lg border border-primary-500/20 ${inter.className}`}>
              <Clock className="w-5 h-5 text-white" />
              <div>
                <div className="text-xs font-semibold text-primary-100 uppercase tracking-wide">Live Update</div>
                <div className="text-sm font-bold text-white">{formatDateTime(lastUpdated, { includeSeconds: true })}</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar - Compact & Prominent */}
        {!isLoading && markets.length > 0 && (
          <div className="flex items-center gap-4 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Assets:</span>
              <span className="text-xl font-bold text-gray-900">{markets.length}</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Gainers:</span>
              <span className="text-xl font-bold text-success-600">{markets.filter(m => m.change > 0).length}</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Losers:</span>
              <span className="text-xl font-bold text-danger-600">{markets.filter(m => m.change < 0).length}</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Unchanged:</span>
              <span className="text-xl font-bold text-gray-600">{markets.filter(m => m.change === 0).length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className={`bg-gradient-to-r from-danger-50 to-danger-100/50 border-2 border-danger-300 rounded-xl p-5 mb-8 shadow-soft ${inter.className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <div className="text-danger-900">
              <h3 className={`font-bold text-lg ${inter.className}`}>Unable to load market data</h3>
              <p className={`mt-1 text-sm font-medium ${inter.className}`}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today in Markets Section */}
      <section className="mb-12 gradient-mesh rounded-2xl p-8 -mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden">
        {/* Subtle floating orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-900/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-500/8 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-accent-600 rounded-full"></div>
                <h2 className={`text-3xl font-bold text-primary-900 ${inter.className}`}>
                  Today in the Markets
                </h2>
              </div>
              <p className="text-sm text-gray-600 ml-16">Live market data with AI insights</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 ${inter.className}`}>
              <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-700">LIVE</span>
            </div>
          </div>
        </div>

        {/* Market Cards Horizontal Scroll */}
        <div className={`relative z-10 overflow-x-auto custom-scrollbar ${inter.className}`}>
          <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`flex-none w-64 ${inter.className}`}>
                    <MarketCardSkeleton />
                  </div>
                ))
              : markets.map((market) => (
                  <div key={market.symbol} className={`flex-none w-64 ${inter.className}`}>
                    <MarketCardModern
                      data={market}
                      onClick={handleMarketCardClick}
                      onQuickView={handleQuickView}
                    />
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <LatestNewsSection maxItems={5} />

      {/* Footer Info */}
      <div className={`mt-16 text-center ${inter.className}`}>
        <div className="inline-block px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
          <p className="text-sm font-medium text-gray-700">
            Market data provided for informational purposes only.
            <Link href="/disclaimer" className={`text-primary-600 hover:text-primary-800 font-bold ml-2 underline decoration-2 underline-offset-2 ${inter.className}`}>
              View disclaimer
            </Link>
          </p>
        </div>
      </div>

      {/* Market Detail Modal */}
      {isModalOpen && selectedMarketData && selectedPopupData && !isLoadingModal && (
        <MarketDetailModalV2
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          marketData={selectedMarketData}
          popupData={selectedPopupData}
        />
      )}
    </div>
  );
}