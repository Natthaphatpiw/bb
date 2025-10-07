'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Sarabun } from 'next/font/google';
import Button from '@/components/ui/Button';
import PriceForecastTable from '@/components/market/PriceForecastTable';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import NewsFeed from '@/components/news/NewsFeed';
import {
  getMarketDataByKey,
  MarketData,
  convertToModalData
} from '@/lib/realDataApi';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

type TabType = 'overview' | 'news' | 'report';

interface MarketDetailPageProps {
  marketKey: 'crude_oil' | 'sugar' | 'usd_thb';
}

export default function MarketDetailPage({ marketKey }: MarketDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, [marketKey]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await getMarketDataByKey(marketKey);
      setMarketData(data);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !marketData) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 ${sarabun.className}`}>
        <ChartSkeleton />
      </div>
    );
  }

  const { popup, forecasts, news, report } = marketData;
  const modalData = convertToModalData(popup, marketData);

  const globalAnalysis = popup.regionalAnalysis.find(r => r.region === 'global');
  const asiaAnalysis = popup.regionalAnalysis.find(r => r.region === 'asia');
  const thailandAnalysis = popup.regionalAnalysis.find(r => r.region === 'thailand');

  // Format price based on market unit
  const formatPrice = (price: number) => {
    if (marketData.unit === 'THB') {
      return `฿${price.toFixed(2)}`;
    } else if (marketData.unit === 'USD/lb') {
      return `$${price.toFixed(4)}/lb`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${sarabun.className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-medium border-b-2 border-primary-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => router.push('/')}
                className="p-3 hover:bg-primary-100 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-primary-300"
              >
                <ArrowLeft className="w-6 h-6 text-primary-600" />
              </button>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  {marketData.marketNameTh}
                </h1>
                <p className="text-base font-semibold text-gray-600 mt-1">{marketData.symbol}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Price Display */}
              <div className="text-right px-6 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-soft">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(popup.currentPrice)}
                </div>
                <div className={`text-base font-bold mt-1 ${
                  popup.priceChange >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {popup.priceChange >= 0 ? '+' : ''}{popup.priceChange.toFixed(2)}
                  ({popup.priceChangePercent >= 0 ? '+' : ''}{popup.priceChangePercent.toFixed(2)}%)
                </div>
              </div>

              <Button
                onClick={loadMarketData}
                variant="outline"
                size="sm"
                className="gap-2 px-5 py-3 border-2 border-primary-300 hover:bg-primary-50 hover:border-primary-400 text-primary-700 font-bold"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b-2 border-gray-200">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-6 border-b-4 font-bold text-base transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'border-accent-500 text-accent-700 bg-accent-50/50'
                    : 'border-transparent text-gray-600 hover:text-primary-700 hover:border-primary-300 hover:bg-primary-50/30'
                }`}
              >
                Market Overview
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`pb-4 px-6 border-b-4 font-bold text-base transition-all duration-200 ${
                  activeTab === 'news'
                    ? 'border-accent-500 text-accent-700 bg-accent-50/50'
                    : 'border-transparent text-gray-600 hover:text-primary-700 hover:border-primary-300 hover:bg-primary-50/30'
                }`}
              >
                News Analysis ({news.news.length})
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`pb-4 px-6 border-b-4 font-bold text-base transition-all duration-200 ${
                  activeTab === 'report'
                    ? 'border-accent-500 text-accent-700 bg-accent-50/50'
                    : 'border-transparent text-gray-600 hover:text-primary-700 hover:border-primary-300 hover:bg-primary-50/30'
                }`}
              >
                Full Report
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive Summary / Verdict */}
            <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 border-4 border-accent-300 rounded-2xl p-8 shadow-hard">
              <h2 className="text-2xl font-bold text-accent-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                คำแนะนำ & แผนปฏิบัติ
              </h2>

              <div className="space-y-4 mb-6">
                {globalAnalysis && (
                  <>
                    <div className="flex items-start gap-3 bg-white/60 p-4 rounded-lg border-2 border-accent-200">
                      <span className="text-accent-600 mt-1 text-xl font-bold">•</span>
                      <p className="text-gray-800 font-medium text-base">{globalAnalysis.dailySummary}</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 p-4 rounded-lg border-2 border-accent-200">
                      <span className="text-accent-600 mt-1 text-xl font-bold">•</span>
                      <p className="text-gray-800 font-medium text-base">{globalAnalysis.ourRecommendedAction}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-gradient-primary hover:shadow-glow-primary text-white font-bold px-6 py-3"
                >
                  ดาวน์โหลดรายงาน PDF
                </Button>
                <Button variant="outline" size="md" className="border-2 border-accent-400 text-accent-700 hover:bg-accent-50 font-bold px-6 py-3">
                  แชร์รายงาน
                </Button>
              </div>
            </div>

            {/* Price Forecast */}
            <div className="bg-white border-2 border-primary-200 rounded-2xl p-8 shadow-medium">
              <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📈</span>
                </div>
                การคาดการณ์ราคา (Quarterly Forecast)
              </h2>
              <PriceForecastTable
                forecasts={forecasts.forecasts.map(f => ({
                  quarter: f.quarter,
                  priceTarget: parseFloat(f.price_forecast.replace(/[^\d.-]/g, '')),
                  confidence: 70,
                  change: 0,
                  changePercent: 0,
                  actionRecommendation: `แหล่งที่มา: ${f.source}`
                }))}
                currentPrice={popup.currentPrice}
                currency={marketData.unit}
              />
            </div>

            {/* Regional Analysis - Show All 3 Regions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Global */}
              {globalAnalysis && (
                <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                  <h3 className="font-bold text-blue-900 text-lg mb-4 pb-3 border-b-2 border-blue-200 flex items-center gap-2">
                    <span className="text-2xl">🌍</span> Global Market
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                      <div className="font-bold text-gray-900 mb-2 text-sm">สถานการณ์:</div>
                      <div className="text-gray-700 text-sm font-medium">{globalAnalysis.dailySummary}</div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                      <div className="font-bold text-gray-900 mb-2 text-sm">Key Signals:</div>
                      <div className="space-y-2">
                        {globalAnalysis.keySignals.map((signal, idx) => (
                          <div key={idx} className="text-gray-700 text-sm font-medium flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{signal.title}: {signal.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-3">
                      <div className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">คู่แข่งกำลังทำ:</div>
                      <div className="text-gray-800 text-sm font-medium">{globalAnalysis.competitorStrategy}</div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 border-2 border-primary-400 rounded-lg p-3">
                      <div className="font-bold text-primary-900 mb-2 text-xs uppercase tracking-wide">เราควรทำ:</div>
                      <div className="text-primary-800 text-sm font-bold">{globalAnalysis.ourRecommendedAction}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Asia */}
              {asiaAnalysis && (
                <div className="bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                  <h3 className="font-bold text-amber-900 text-lg mb-4 pb-3 border-b-2 border-amber-200 flex items-center gap-2">
                    <span className="text-2xl">🌏</span> Asia Market
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                      <div className="font-bold text-gray-900 mb-2 text-sm">สถานการณ์:</div>
                      <div className="text-gray-700 text-sm font-medium">{asiaAnalysis.dailySummary}</div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                      <div className="font-bold text-gray-900 mb-2 text-sm">Key Signals:</div>
                      <div className="space-y-2">
                        {asiaAnalysis.keySignals.map((signal, idx) => (
                          <div key={idx} className="text-gray-700 text-sm font-medium flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{signal.title}: {signal.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-3">
                      <div className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">คู่แข่งกำลังทำ:</div>
                      <div className="text-gray-800 text-sm font-medium">{asiaAnalysis.competitorStrategy}</div>
                    </div>

                    <div className="bg-gradient-to-br from-accent-100 to-accent-200 border-2 border-accent-400 rounded-lg p-3">
                      <div className="font-bold text-accent-900 mb-2 text-xs uppercase tracking-wide">เราควรทำ:</div>
                      <div className="text-accent-800 text-sm font-bold">{asiaAnalysis.ourRecommendedAction}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thailand */}
              {thailandAnalysis && (
                <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-300 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                  <h3 className="font-bold text-red-900 text-lg mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                    <span className="text-2xl">🇹🇭</span> Thailand Market
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white/80 p-3 rounded-lg border border-red-200">
                      <div className="font-bold text-gray-900 mb-2 text-sm">สถานการณ์:</div>
                      <div className="text-gray-700 text-sm font-medium">{thailandAnalysis.dailySummary}</div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-lg border border-red-200">
                      <div className="font-bold text-gray-900 mb-2 text-sm">Key Signals:</div>
                      <div className="space-y-2">
                        {thailandAnalysis.keySignals.map((signal, idx) => (
                          <div key={idx} className="text-gray-700 text-sm font-medium flex items-start gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <span>{signal.title}: {signal.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-3">
                      <div className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">คู่แข่งกำลังทำ:</div>
                      <div className="text-gray-800 text-sm font-medium">{thailandAnalysis.competitorStrategy}</div>
                    </div>

                    <div className="bg-gradient-to-br from-success-100 to-success-200 border-2 border-success-400 rounded-lg p-3">
                      <div className="font-bold text-success-900 mb-2 text-xs uppercase tracking-wide">เราควรทำ:</div>
                      <div className="text-success-800 text-sm font-bold">{thailandAnalysis.ourRecommendedAction}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* News Analysis Tab */}
        {activeTab === 'news' && (
          <div className="bg-white border-2 border-primary-200 rounded-2xl p-8 shadow-medium">
            <h2 className="text-2xl font-bold text-primary-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📰</span>
              </div>
              News Analysis & Impact Scores
            </h2>
            <NewsFeed newsItems={news.news} itemsPerPage={5} />
          </div>
        )}

        {/* Full Report Tab */}
        {activeTab === 'report' && (
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-2xl p-10 shadow-hard">
            <div className="mb-6 pb-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📄</span>
                </div>
                Full Market Report
              </h2>
            </div>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: report.html }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
