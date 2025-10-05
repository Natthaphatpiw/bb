'use client';

import { MarketImpactOverview, RegionalImpactOverview } from '@/lib/types';
import { X, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MarketImpactModalProps {
  data: MarketImpactOverview;
  isOpen: boolean;
  onClose: () => void;
}

export default function MarketImpactModal({ data, isOpen, onClose }: MarketImpactModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleViewFullReport = () => {
    // Navigate to detail page based on symbol
    const symbol = data.symbol || 'CO';
    router.push(`/markets/${symbol}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl border-2 border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{data.marketName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 3-Column Regional Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
          <RegionalImpactColumn data={data.regionalImpacts.global} title="สถานการณ์ระดับโลก (Global)" />
          <RegionalImpactColumn data={data.regionalImpacts.asia} title="สถานการณ์ภูมิภาคเอเชีย (Asia)" />
          <RegionalImpactColumn data={data.regionalImpacts.thailand} title="สถานการณ์ประเทศไทย (Thailand)" />
        </div>

        {/* Quarterly Forecasts */}
        <div className="px-6 pb-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">คาดการณ์ราคารายไตรมาส</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">ไตรมาส</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">ราคาคาด</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">การเปลี่ยนแปลง</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">คำแนะนำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.quarterlyForecasts.map((forecast, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{forecast.quarter}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      {data.currency === 'USD' ? '$' : ''}{forecast.priceTarget.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${forecast.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {forecast.change >= 0 ? '+' : ''}{forecast.changePercent.toFixed(1)}%
                      </span>
                      <div className="text-xs text-gray-500 mt-0.5">มั่นใจ {forecast.confidence}%</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{forecast.actionRecommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* More Details Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end">
          <button
            onClick={handleViewFullReport}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>ดูรายละเอียดเต็ม</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Regional Impact Column Component
function RegionalImpactColumn({ data, title }: { data: RegionalImpactOverview; title: string }) {
  const getTrendIcon = (trend: 'bullish' | 'bearish' | 'neutral') => {
    if (trend === 'bullish') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'bearish') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: 'bullish' | 'bearish' | 'neutral') => {
    if (trend === 'bullish') return 'text-green-700 bg-green-50 border-green-200';
    if (trend === 'bearish') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
        {title}
      </h3>

      {/* 1. Daily Market Highlight */}
      <div className="border-l-4 border-gray-400 pl-3 py-1 mb-3">
        <div className="text-sm font-semibold text-gray-900 leading-relaxed mb-2">
          {data.dailySummary}
        </div>
        <div className="text-xs text-gray-700 mb-1">
          <span className="font-semibold">→ แนะนำ:</span> {data.actionableInsight}
        </div>
      </div>

      {/* Competitor Strategy + Our Action */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
        <div className="text-xs">
          <div className="font-semibold text-gray-900 mb-1">คู่แข่งในตลาดกำลังทำ:</div>
          <div className="text-gray-700">{data.competitorStrategy}</div>
        </div>
        <div className="text-xs border-t border-gray-200 pt-2">
          <div className="font-semibold text-gray-900 mb-1">เราควรทำ:</div>
          <div className="text-blue-700 font-medium">{data.ourRecommendedAction}</div>
        </div>
      </div>

      {/* 2. Top 2 Key Signals */}
      <div className="border border-gray-200 rounded-lg p-3 space-y-2 mb-3">
        {data.powerfulInsights.slice(0, 2).map((insight, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            <span className="text-base flex-shrink-0">{insight.icon}</span>
            <div>
              <div className="font-semibold text-gray-900">{insight.title}</div>
              <div className="text-gray-600">{insight.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Daily News */}
      {data.dailyNews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700">ข่าวสำคัญวันนี้</h4>
          {data.dailyNews.map((news, index) => (
            <div key={index} className="border border-gray-200 rounded p-2 text-xs">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-gray-900 flex-1">{news.headline}</div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                  news.impactScore >= 70 ? 'bg-red-100 text-red-700' :
                  news.impactScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {news.impactScore}
                </div>
              </div>
              <div className="text-gray-600">{news.summary}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
