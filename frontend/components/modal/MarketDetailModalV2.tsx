'use client';

import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, ArrowRight, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';
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
  impact_level: string;
  trend: 'up' | 'down' | 'neutral';
  summary: string;
  key_factors: string[];
}

interface PersonaRecommendation {
  persona: string;
  persona_name_th: string;
  market_situation: string;
  power_insight: string;
  action_recommendation: string;
  risk_assessment: string;
  opportunity_level: string;
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
}

type PersonaType = 'all' | 'sme' | 'supply_chain' | 'investor';

export default function MarketDetailModalV2({
  isOpen,
  onClose,
  marketData,
  popupData
}: MarketDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('all');

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

  const getPersonaIcon = (persona: string) => {
    const icons: Record<string, string> = {
      sme: '🏢',
      supply_chain: '📦',
      investor: '💼'
    };
    return icons[persona] || '📊';
  };

  const getImpactLevelColor = (level: string) => {
    if (level === 'สูงมาก') return 'bg-danger-100 text-danger-700';
    if (level === 'สูง') return 'bg-accent-100 text-accent-700';
    if (level === 'ปานกลาง') return 'bg-primary-100 text-primary-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('สูง') || risk.includes('มี')) return 'bg-red-100 text-red-700';
    if (risk.includes('ปานกลาง')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getOpportunityColor = (opp: string) => {
    if (opp.includes('ดีมาก') || opp.includes('สูง')) return 'bg-green-100 text-green-700';
    if (opp.includes('ดี') || opp.includes('ปานกลาง')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatRiskLabel = (risk: string) => {
    // แปลง "ความเสี่ยงสูง" -> "⚠️ ระวัง"
    // แปลง "ความเสี่ยงปานกลาง" -> "⚡ พอใช้"
    // แปลง "ความเสี่ยงต่ำ" -> "✓ ปลอดภัย"
    if (risk.includes('สูง') || risk.includes('มี')) return '⚠️ ระวัง';
    if (risk.includes('ปานกลาง')) return '⚡ พอใช้';
    return '✓ ปลอดภัย';
  };

  const formatOpportunityLabel = (opp: string) => {
    // แปลง "โอกาสดีมาก" -> "🎯 โอกาสดีมาก"
    // แปลง "โอกาสดี" -> "👍 โอกาสดี"
    // แปลง "โอกาสปานกลาง" -> "👌 พอใช้"
    if (opp.includes('ดีมาก') || opp.includes('สูง')) return '🎯 โอกาสดีมาก';
    if (opp.includes('ดี')) return '👍 โอกาสดี';
    return '👌 พอใช้';
  };

  const filteredRecommendations = selectedPersona === 'all'
    ? popupData.recommendations
    : popupData.recommendations.filter(r => r.persona === selectedPersona);

  return (
    <div className={`fixed inset-0 z-50 ${inter.className}`}>
      {/* Backdrop - คลิกเพื่อปิด */}
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
          <div className="sticky top-6">
            <div className="glass-effect rounded-2xl p-6 shadow-2xl border border-white/20">
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
              <div className="space-y-3 mb-6">
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

              {/* View Detail Button */}
              <Link
                href={`/markets/${marketData.symbol}`}
                className="block w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-center rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                ดูรายละเอียดเพิ่มเติม
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Main Content (4/6 of screen) */}
        <div
          className={`
            flex-1 h-full overflow-y-auto custom-scrollbar relative
            transform transition-all duration-500 ease-out delay-100
            ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          `}
        >
          {/* Sticky Close Button - มุมขวาบน */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 p-3 rounded-full bg-white hover:bg-gray-100 shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-primary-900 mb-2">
                การวิเคราะห์ตลาด {marketData.name_th}
              </h2>
              <p className="text-gray-600">{popupData.quick_summary}</p>
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
                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getImpactLevelColor(region.impact_level)}`}>
                          {region.impact_level}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getTrendColor(region.trend)}`}>
                          {getTrendIcon(region.trend)}
                          <span className="text-xs font-bold">{region.impact_score}</span>
                        </div>
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

            {/* Section 2: Persona Recommendations - with Filter */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full" />
                  <h3 className="text-2xl font-bold text-primary-900">
                    คำแนะนำเฉพาะกลุ่ม
                  </h3>
                </div>

                {/* Persona Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPersona('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPersona === 'all'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setSelectedPersona('sme')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPersona === 'sme'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🏢 SME
                  </button>
                  <button
                    onClick={() => setSelectedPersona('supply_chain')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPersona === 'supply_chain'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📦 Supply Chain
                  </button>
                  <button
                    onClick={() => setSelectedPersona('investor')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPersona === 'investor'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    💼 Investor
                  </button>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                {filteredRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="group p-5 rounded-xl border border-gray-200 hover:border-accent-300 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getPersonaIcon(rec.persona)}</span>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{rec.persona_name_th}</h4>
                          <p className="text-xs text-gray-600 mt-0.5">{rec.market_situation}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getRiskColor(rec.risk_assessment)}`}>
                          {formatRiskLabel(rec.risk_assessment)}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getOpportunityColor(rec.opportunity_level)}`}>
                          {formatOpportunityLabel(rec.opportunity_level)}
                        </span>
                      </div>
                    </div>

                    {/* Power Insight - ขนาดเล็กลง */}
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-2 border-blue-400">
                      <p className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1.5">
                        <span>💡</span> ข้อมูลสำคัญ
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed">{rec.power_insight}</p>
                    </div>

                    {/* Action Recommendation - ขนาดเล็กลง */}
                    <div className="p-3 bg-amber-50 rounded-lg border-l-2 border-amber-500">
                      <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
                        <span>⚡</span> ควรทำอย่างไร
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed">{rec.action_recommendation}</p>
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
                        ผลกระทบ: {popupData.top_news.impact_score}
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
