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
  getMarketData,
  MarketData,
  convertToModalData
} from '@/lib/realDataApi';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

type TabType = 'overview' | 'news' | 'report';

export default function CrudeOilDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await getMarketData();
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
  const modalData = convertToModalData(popup);

  const globalAnalysis = popup.regionalAnalysis.find(r => r.region === 'global');
  const asiaAnalysis = popup.regionalAnalysis.find(r => r.region === 'asia');
  const thailandAnalysis = popup.regionalAnalysis.find(r => r.region === 'thailand');

  return (
    <div className={`min-h-screen bg-gray-50 ${sarabun.className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">Crude Oil (WTI)</h1>
                <p className="text-sm text-gray-500">CL=F</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Price Display */}
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${popup.currentPrice.toFixed(2)}
                </div>
                <div className={`text-sm font-semibold ${
                  popup.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {popup.priceChange >= 0 ? '+' : ''}{popup.priceChange.toFixed(2)}
                  ({popup.priceChangePercent >= 0 ? '+' : ''}{popup.priceChangePercent.toFixed(2)}%)
                </div>
              </div>

              <Button
                onClick={loadMarketData}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Market Overview
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'news'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                News Analysis ({news.news.length})
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'report'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="space-y-6">
            {/* Executive Summary / Verdict */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                คำแนะนำ & แผนปฏิบัติ
              </h2>

              <div className="space-y-3 mb-4">
                {globalAnalysis && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <p className="text-gray-700">{globalAnalysis.dailySummary}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <p className="text-gray-700">{globalAnalysis.ourRecommendedAction}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  ดาวน์โหลดรายงาน PDF
                </Button>
                <Button variant="outline" size="md">
                  แชร์รายงาน
                </Button>
              </div>
            </div>

            {/* Price Forecast */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                การคาดการณ์ราคา (Quarterly Forecast)
              </h2>
              <PriceForecastTable
                forecasts={forecasts.forecasts.map(f => ({
                  quarter: f.quarter,
                  priceTarget: parseFloat(f.price_forecast.replace('$', '').split('-')[0]),
                  confidence: 70,
                  change: 0,
                  changePercent: 0,
                  actionRecommendation: `แหล่งที่มา: ${f.source}`
                }))}
                currentPrice={popup.currentPrice}
                currency="USD"
              />
            </div>

            {/* Regional Analysis - Show All 3 Regions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Global */}
              {globalAnalysis && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    🌍 Global Market
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">สถานการณ์:</div>
                      <div className="text-gray-700">{globalAnalysis.dailySummary}</div>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Key Signals:</div>
                      <div className="space-y-1">
                        {globalAnalysis.keySignals.map((signal, idx) => (
                          <div key={idx} className="text-gray-700">
                            • {signal.title}: {signal.value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded p-2">
                      <div className="font-semibold text-gray-900 text-xs mb-1">คู่แข่งกำลังทำ:</div>
                      <div className="text-gray-700 text-xs">{globalAnalysis.competitorStrategy}</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="font-semibold text-blue-900 text-xs mb-1">เราควรทำ:</div>
                      <div className="text-blue-700 text-xs">{globalAnalysis.ourRecommendedAction}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Asia */}
              {asiaAnalysis && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    🌏 Asia Market
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">สถานการณ์:</div>
                      <div className="text-gray-700">{asiaAnalysis.dailySummary}</div>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Key Signals:</div>
                      <div className="space-y-1">
                        {asiaAnalysis.keySignals.map((signal, idx) => (
                          <div key={idx} className="text-gray-700">
                            • {signal.title}: {signal.value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded p-2">
                      <div className="font-semibold text-gray-900 text-xs mb-1">คู่แข่งกำลังทำ:</div>
                      <div className="text-gray-700 text-xs">{asiaAnalysis.competitorStrategy}</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="font-semibold text-blue-900 text-xs mb-1">เราควรทำ:</div>
                      <div className="text-blue-700 text-xs">{asiaAnalysis.ourRecommendedAction}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thailand */}
              {thailandAnalysis && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    🇹🇭 Thailand Market
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">สถานการณ์:</div>
                      <div className="text-gray-700">{thailandAnalysis.dailySummary}</div>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Key Signals:</div>
                      <div className="space-y-1">
                        {thailandAnalysis.keySignals.map((signal, idx) => (
                          <div key={idx} className="text-gray-700">
                            • {signal.title}: {signal.value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded p-2">
                      <div className="font-semibold text-gray-900 text-xs mb-1">คู่แข่งกำลังทำ:</div>
                      <div className="text-gray-700 text-xs">{thailandAnalysis.competitorStrategy}</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="font-semibold text-blue-900 text-xs mb-1">เราควรทำ:</div>
                      <div className="text-blue-700 text-xs">{thailandAnalysis.ourRecommendedAction}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* News Analysis Tab */}
        {activeTab === 'news' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              News Analysis & Impact Scores
            </h2>
            <NewsFeed newsItems={news.news} itemsPerPage={5} />
          </div>
        )}

        {/* Full Report Tab */}
        {activeTab === 'report' && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
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
