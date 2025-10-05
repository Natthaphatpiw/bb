'use client';

import { MarketOpportunityBriefing as MOBType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface MOBProps {
  data: MOBType;
  currency: string;
}

export default function MarketOpportunityBriefing({ data, currency }: MOBProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getScenarioIcon = (type: 'bull' | 'base' | 'bear') => {
    switch (type) {
      case 'bull':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'bear':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getScenarioColor = (type: 'bull' | 'base' | 'bear') => {
    switch (type) {
      case 'bull':
        return 'border-green-200 bg-green-50';
      case 'bear':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getScenarioLabel = (type: 'bull' | 'base' | 'bear') => {
    switch (type) {
      case 'bull':
        return 'BULL CASE';
      case 'bear':
        return 'BEAR CASE';
      default:
        return 'BASE CASE';
    }
  };

  return (
    <div className={`space-y-6 ${sarabun.className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className={`text-2xl font-bold mb-2 text-gray-900 ${sarabun.className}`}>
              MARKET OPPORTUNITY BRIEFING: {data.symbol}
            </h1>
            <p className={`text-gray-600 ${sarabun.className}`}>
              ประจำวันที่: {formatDate(data.briefingDate)}
            </p>
            <h2 className={`text-xl font-semibold mt-3 text-gray-900 ${sarabun.className}`}>
              {data.title}
            </h2>
            {data.subtitle && (
              <p className={`text-gray-700 mt-1 ${sarabun.className}`}>
                {data.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 1. Verdict & Action Plan - Moved to top */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <h2 className={`text-xl font-bold text-gray-900 ${sarabun.className}`}>
            คำตัดสินและแผนปฏิบัติการ (The Verdict & Action Plan)
          </h2>
        </div>

        <div className="mb-5">
          <h3 className={`font-semibold mb-3 text-gray-900 ${sarabun.className}`}>
            สรุป {data.verdict.summaryPoints.length} ข้อที่คุณต้องรู้เดี๋ยวนี้:
          </h3>
          <div className="space-y-2">
            {data.verdict.summaryPoints.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className={`font-bold text-blue-600 ${sarabun.className}`}>{idx + 1}.</span>
                <p className={`text-gray-700 ${sarabun.className}`}>{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {data.verdict.actionButtons.map((button, idx) => (
            <button
              key={idx}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-lg font-medium transition-all ${sarabun.className}`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Executive Summary */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <h2 className={`text-xl font-bold text-gray-900 ${sarabun.className}`}>
            บทสรุปสำหรับผู้บริหาร (Executive Summary)
          </h2>
        </div>
        <p className={`text-gray-700 leading-relaxed text-base ${sarabun.className}`}>
          {data.executiveSummary}
        </p>
      </section>

      {/* 3. Narrative Arc */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <h2 className={`text-xl font-bold text-gray-900 ${sarabun.className}`}>
            โครงเรื่อง: {data.narrative.mainTitle}
          </h2>
        </div>

        <div className="space-y-6">
          {data.narrative.chapters.map((chapter, idx) => (
            <div key={idx} className="border-l-4 border-indigo-400 pl-4">
              <h3 className={`text-lg font-bold text-gray-900 mb-1 ${sarabun.className}`}>
                {chapter.title}
              </h3>
              <p className={`text-sm text-gray-600 mb-3 ${sarabun.className}`}>
                {chapter.subtitle}
              </p>
              <div className="space-y-2">
                {chapter.events.map((event, eventIdx) => (
                  <div key={eventIdx} className="flex items-start space-x-2">
                    <span className="text-gray-400 mt-1">├─</span>
                    <div>
                      <span className={`font-medium text-gray-700 ${sarabun.className}`}>
                        [{event.label}]
                      </span>
                      <span className={`text-gray-600 ml-2 ${sarabun.className}`}>
                        {event.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Scenarios */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
            4
          </div>
          <h2 className={`text-xl font-bold text-gray-900 ${sarabun.className}`}>
            ภาพฉากทัศน์ที่เป็นไปได้ (Next 30 Days)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data.scenarios.map((scenario, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-lg p-5 ${getScenarioColor(scenario.type)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getScenarioIcon(scenario.type)}
                  <div>
                    <div className={`font-bold text-lg ${sarabun.className}`}>
                      {getScenarioLabel(scenario.type)} ({scenario.probability}% probability)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${sarabun.className}`}>
                    {formatCurrency(scenario.priceTarget, currency)}
                  </div>
                  <div className={`text-sm font-medium ${scenario.priceChange >= 0 ? 'text-green-700' : 'text-red-700'} ${sarabun.className}`}>
                    ({scenario.priceChange >= 0 ? '+' : ''}{scenario.priceChange}%)
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 mt-0.5">├─</span>
                  <div>
                    <span className={`font-semibold text-gray-700 ${sarabun.className}`}>Trigger:</span>
                    <span className={`text-gray-600 ml-2 ${sarabun.className}`}>{scenario.trigger}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 mt-0.5">├─</span>
                  <div>
                    <span className={`font-semibold text-gray-700 ${sarabun.className}`}>Business Impact:</span>
                    <span className={`text-gray-600 ml-2 ${sarabun.className}`}>{scenario.businessImpact}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 mt-0.5">└─</span>
                  <div>
                    <span className={`font-semibold text-gray-700 ${sarabun.className}`}>Action:</span>
                    <span className={`text-gray-600 ml-2 ${sarabun.className}`}>{scenario.actionRecommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. The Stakes */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
            5
          </div>
          <h2 className={`text-xl font-bold text-gray-900 ${sarabun.className}`}>
            ผลได้-ผลเสียเชิงตัวเลข (The Stakes)
          </h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <div className="flex items-start space-x-2">
            <span className="text-gray-400">•</span>
            <div>
              <span className={`font-semibold text-gray-700 ${sarabun.className}`}>ACTION:</span>
              <span className={`text-gray-600 ml-2 ${sarabun.className}`}>{data.stakes.action}</span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <span className={`font-semibold text-green-700 ${sarabun.className}`}>PROFIT POTENTIAL:</span>
              <span className={`text-gray-600 ml-2 ${sarabun.className}`}>{data.stakes.profitPotential}</span>
              <span className={`font-bold text-green-700 ml-2 ${sarabun.className}`}>
                {formatCurrency(data.stakes.profitAmount, currency)}
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <span className={`font-semibold text-red-700 ${sarabun.className}`}>RISK:</span>
              <span className={`text-gray-600 ml-2 ${sarabun.className}`}>{data.stakes.risk}</span>
              <span className={`font-bold text-red-700 ml-2 ${sarabun.className}`}>
                {formatCurrency(data.stakes.riskAmount, currency)}
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-2 pt-2 border-t border-gray-200">
            <span className="text-gray-400">•</span>
            <div>
              <span className={`font-semibold text-gray-700 ${sarabun.className}`}>RISK/REWARD RATIO:</span>
              <span className={`font-bold text-blue-700 ml-2 text-lg ${sarabun.className}`}>
                1 : {data.stakes.riskRewardRatio.toFixed(1)}
              </span>
              <span className={`text-sm text-gray-600 ml-2 ${sarabun.className}`}>
                ({data.stakes.riskRewardRatio >= 3 ? 'คุ้มค่าที่จะลงมือทำ' : 'พิจารณาความเสี่ยง'})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className={`text-center text-sm text-gray-500 ${sarabun.className}`}>
        <p>
          รายงานนี้สร้างขึ้นเมื่อ {new Date(data.generatedAt).toLocaleString('th-TH')} •
          ข้อมูลอัพเดทล่าสุด: {new Date(data.expiresAt).toLocaleString('th-TH')}
        </p>
      </div>
    </div>
  );
}
