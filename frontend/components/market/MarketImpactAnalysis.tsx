'use client';

import { useState } from 'react';
import { MarketImpactAnalysis as ImpactType } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, Globe, MapPin } from 'lucide-react';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface MarketImpactAnalysisProps {
  impactData: {
    global: ImpactType;
    asia: ImpactType;
    thailand: ImpactType;
  };
}

type RegionTab = 'global' | 'asia' | 'thailand';

export default function MarketImpactAnalysis({ impactData }: MarketImpactAnalysisProps) {
  const [activeTab, setActiveTab] = useState<RegionTab>('global');

  const currentData = impactData[activeTab];

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTabIcon = (tab: RegionTab) => {
    switch (tab) {
      case 'global':
        return <Globe className="w-4 h-4" />;
      case 'asia':
        return <MapPin className="w-4 h-4" />;
      case 'thailand':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getTabLabel = (tab: RegionTab) => {
    switch (tab) {
      case 'global':
        return 'Global';
      case 'asia':
        return 'Asia';
      case 'thailand':
        return 'Thailand';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${sarabun.className}`}>
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h2 className={`text-xl font-bold text-gray-900 mb-4 ${sarabun.className}`}>
            Market Impact Analysis
          </h2>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['global', 'asia', 'thailand'] as RegionTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                } ${sarabun.className}`}
              >
                {getTabIcon(tab)}
                <span>{getTabLabel(tab)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div>
          <h3 className={`text-base font-semibold text-gray-900 mb-2 ${sarabun.className}`}>
            Overview
          </h3>
          <p className={`text-gray-700 leading-relaxed ${sarabun.className}`}>
            {currentData.summary}
          </p>
        </div>

        {/* Key Factors */}
        <div>
          <h3 className={`text-base font-semibold text-gray-900 mb-3 ${sarabun.className}`}>
            Key Impact Factors
          </h3>
          <div className="space-y-3">
            {currentData.keyFactors.map((item, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getImpactColor(item.impact)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getImpactIcon(item.impact)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${sarabun.className}`}>
                      {item.factor}
                    </h4>
                    <p className={`text-sm ${sarabun.className}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Indicators */}
        <div>
          <h3 className={`text-base font-semibold text-gray-900 mb-3 ${sarabun.className}`}>
            Economic Indicators
          </h3>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {currentData.economicIndicators.map((indicator, idx) => (
                <div key={idx} className="px-4 py-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium text-gray-900 ${sarabun.className}`}>
                          {indicator.indicator}
                        </span>
                        {getTrendIcon(indicator.trend)}
                      </div>
                      <p className={`text-sm text-gray-600 mt-1 ${sarabun.className}`}>
                        {indicator.description}
                      </p>
                    </div>
                    <div className={`ml-4 text-right ${sarabun.className}`}>
                      <div className={`font-bold text-lg ${
                        indicator.trend === 'up' ? 'text-green-600' :
                        indicator.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {indicator.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outlook */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className={`text-base font-semibold text-blue-900 mb-2 ${sarabun.className}`}>
            Market Outlook
          </h3>
          <p className={`text-blue-800 leading-relaxed ${sarabun.className}`}>
            {currentData.outlook}
          </p>
        </div>
      </div>
    </div>
  );
}
