'use client';

import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, ArrowRight, ExternalLink } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface KeyMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

interface RegionalImpact {
  region: string;
  region_name_th: string;
  impact_score: number;
  trend: 'up' | 'down' | 'neutral';
  summary: string;
  key_factors: string[];
}

interface ActionItem {
  action: string;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface PersonaRecommendation {
  persona: string;
  persona_name_th: string;
  summary: string;
  key_insight: string;
  actions: ActionItem[];
  risk_level: string;
  opportunity_score: number;
}

interface TopNews {
  title: string;
  summary: string;
  impact_score: number;
  published_date: string;
  image_url: string;
  link: string;
}

interface PriceForecast {
  quarter: string;
  date: string;
  price_forecast: string;
  source: string;
}

interface PopupData {
  key_metrics: KeyMetric[];
  quick_summary: string;
  regional_impacts: RegionalImpact[];
  recommendations: PersonaRecommendation[];
  top_news: TopNews;
  price_forecasts: PriceForecast[];
}

interface MarketData {
  symbol: string;
  name: string;
  name_th: string;
  unit: string;
  current_price: number;
  price_change: number;
  price_change_pct: number;
}

interface MarketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketData: MarketData | null;
  popupData: PopupData | null;
  cardPosition?: { top: number; left: number; width: number; height: number };
}

export default function MarketDetailModal({
  isOpen,
  onClose,
  marketData,
  popupData,
  cardPosition
}: MarketDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sme' | 'supply_chain' | 'investor'>('all');

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !marketData || !popupData) return null;

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-danger-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-success-600 bg-success-50';
    if (trend === 'down') return 'text-danger-600 bg-danger-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-danger-100 text-danger-700 border-danger-300';
    if (priority === 'medium') return 'bg-accent-100 text-accent-700 border-accent-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getPersonaIcon = (persona: string) => {
    const icons: Record<string, string> = {
      sme: '🏢',
      supply_chain: '📦',
      investor: '💼'
    };
    return icons[persona] || '📊';
  };

  return (
    <div className={`fixed inset-0 z-50 ${inter.className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full h-full flex items-start justify-start p-6">
        {/* Left Side - Minimized Card */}
        <div
          className={`
            relative w-80 h-full flex-shrink-0 mr-6
            transform transition-all duration-500 ease-out
            ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
          `}
        >
          <div className="sticky top-6 glass-effect rounded-2xl p-6 shadow-2xl border border-white/20">
            {/* Card Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {marketData.symbol}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${marketData.price_change_pct >= 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
                  {getTrendIcon(marketData.price_change_pct >= 0 ? 'up' : 'down')}
                  <span className={`text-xs font-bold ${marketData.price_change_pct >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                    {marketData.price_change_pct >= 0 ? '+' : ''}{marketData.price_change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-1">
                {marketData.name_th}
              </h3>
              <p className="text-sm text-gray-600">{marketData.name}</p>
            </div>

            {/* Price Display */}
            <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100">
              <p className="text-xs text-gray-600 mb-1">ราคาปัจจุบัน</p>
              <p className="text-3xl font-extrabold text-primary-900">
                {marketData.current_price.toFixed(2)}
                <span className="text-lg font-normal text-gray-600 ml-2">{marketData.unit}</span>
              </p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                ตัวชี้วัดหลัก
              </p>
              {popupData.key_metrics.slice(0, 4).map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <span className="text-sm text-gray-700">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Main Content (4/6 of screen) */}
        <div
          className={`
            flex-1 h-full overflow-y-auto custom-scrollbar
            transform transition-all duration-500 ease-out delay-100
            ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          `}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl">
            {/* Header with Close Button */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-primary-900 mb-2">
                  การวิเคราะห์ตลาด {marketData.name_th}
                </h2>
                <p className="text-gray-600">{popupData.quick_summary}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Section 1: Regional Impacts - 3 Columns */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                <h3 className="text-2xl font-bold text-primary-900">
                  ผลกระทบตามภูมิภาค
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {popupData.regional_impacts.map((region, idx) => (
                  <div
                    key={idx}
                    className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">
                        {region.region_name_th}
                      </h4>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getTrendColor(region.trend)}`}>
                        {getTrendIcon(region.trend)}
                        <span className="text-sm font-bold">{region.impact_score}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      {region.summary}
                    </p>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">ปัจจัยสำคัญ</p>
                      {region.key_factors.map((factor, fidx) => (
                        <div key={fidx} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Persona Recommendations - 3 Rows */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full" />
                <h3 className="text-2xl font-bold text-primary-900">
                  คำแนะนำเฉพาะกลุ่ม
                </h3>
              </div>

              <div className="space-y-4">
                {popupData.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-accent-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-white to-accent-50/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getPersonaIcon(rec.persona)}</span>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{rec.persona_name_th}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">ความเสี่ยง</p>
                          <p className="text-sm font-bold text-gray-900">{rec.risk_level}</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-accent-200 flex items-center justify-center bg-white">
                          <span className="text-lg font-bold text-accent-600">{rec.opportunity_score}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Insight */}
                    <div className="mb-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                      <p className="text-xs font-semibold text-primary-600 uppercase mb-2">💡 Insight สำคัญ</p>
                      <p className="text-sm font-medium text-primary-900">{rec.key_insight}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">แผนปฏิบัติการ</p>
                      {rec.actions.map((action, aidx) => (
                        <div
                          key={aidx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-accent-200 transition-colors"
                        >
                          <div className={`px-2 py-1 rounded-md text-xs font-bold border ${getPriorityColor(action.priority)}`}>
                            {action.priority.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">{action.action}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>⏱️ {action.timeline}</span>
                              <span className="text-gray-400">•</span>
                              <span>{action.reason}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Top News */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-danger-500 to-accent-500 rounded-full" />
                <h3 className="text-2xl font-bold text-primary-900">
                  ข่าวสำคัญ
                </h3>
              </div>

              <div className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-danger-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-danger-50/20">
                <div className="flex gap-6">
                  {popupData.top_news.image_url && (
                    <img
                      src={popupData.top_news.image_url}
                      alt={popupData.top_news.title}
                      className="w-48 h-32 object-cover rounded-xl flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-danger-100 text-danger-700 text-xs font-bold rounded-full">
                        Impact: {popupData.top_news.impact_score}
                      </span>
                      <span className="text-xs text-gray-500">{popupData.top_news.published_date}</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{popupData.top_news.title}</h4>
                    <p className="text-sm text-gray-700 mb-4">{popupData.top_news.summary}</p>
                    <a
                      href={popupData.top_news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      อ่านต่อ <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Price Forecast */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-success-500 to-primary-500 rounded-full" />
                <h3 className="text-2xl font-bold text-primary-900">
                  พยากรณ์ราคา
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ไตรมาส</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">วันที่</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ราคาคาดการณ์</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">แหล่งข้อมูล</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popupData.price_forecasts.map((forecast, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">{forecast.quarter}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{forecast.date}</td>
                        <td className="py-3 px-4 text-sm font-bold text-primary-600">{forecast.price_forecast}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{forecast.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
