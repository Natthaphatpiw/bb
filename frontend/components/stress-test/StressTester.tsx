'use client';

import { useState } from 'react';
import { AlertTriangle, Calculator, TrendingDown, Globe, Zap } from 'lucide-react';
import { Sarabun } from 'next/font/google';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface StressScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  impactFactors: {
    [key: string]: number; // commodity symbol -> impact multiplier
  };
}

interface CostImpact {
  commodity: string;
  currentPrice: number;
  stressedPrice: number;
  impact: number;
  costIncrease: number;
}

const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'pandemic',
    name: 'Global Pandemic',
    description: 'Supply chain disruption, logistics delays, factory shutdowns',
    icon: <Globe className="w-5 h-5" />,
    severity: 'high',
    impactFactors: {
      'WTI': 0.7,    // Oil drops initially
      'SUGAR': 1.15, // Food commodities spike
      'COPPER': 0.85, // Industrial metals drop
      'USDTHB': 1.08, // USD strengthens
      'EURTHB': 0.95, // EUR weakens vs THB
      'CNYTHB': 1.02  // CNY stable
    }
  },
  {
    id: 'geopolitical',
    name: 'Geopolitical Crisis',
    description: 'Regional conflict affecting major supply routes',
    icon: <AlertTriangle className="w-5 h-5" />,
    severity: 'extreme',
    impactFactors: {
      'WTI': 1.25,   // Oil spikes
      'SUGAR': 1.18, // Commodity volatility
      'COPPER': 1.12, // Safe haven demand
      'USDTHB': 1.15, // Flight to USD
      'EURTHB': 0.88, // EUR weakness
      'CNYTHB': 0.92  // CNY pressure
    }
  },
  {
    id: 'inflation_shock',
    name: 'Inflation Shock',
    description: 'Central bank rate hikes, currency volatility',
    icon: <TrendingDown className="w-5 h-5" />,
    severity: 'medium',
    impactFactors: {
      'WTI': 1.08,
      'SUGAR': 1.12,
      'COPPER': 0.95,
      'USDTHB': 1.12,
      'EURTHB': 0.93,
      'CNYTHB': 0.96
    }
  },
  {
    id: 'supply_shock',
    name: 'Supply Chain Shock',
    description: 'Major port closures, shipping disruptions',
    icon: <Zap className="w-5 h-5" />,
    severity: 'high',
    impactFactors: {
      'WTI': 1.15,
      'SUGAR': 1.22,
      'COPPER': 1.18,
      'USDTHB': 1.06,
      'EURTHB': 0.98,
      'CNYTHB': 1.01
    }
  }
];

// Mock current market data
const CURRENT_PRICES = {
  'WTI': { price: 85.50, symbol: 'WTI', name: 'Crude Oil', currency: 'USD' },
  'SUGAR': { price: 24.80, symbol: 'SUGAR', name: 'Sugar', currency: 'USD' },
  'COPPER': { price: 8450.00, symbol: 'COPPER', name: 'Copper', currency: 'USD' },
  'USDTHB': { price: 35.25, symbol: 'USDTHB', name: 'USD/THB', currency: 'THB' },
  'EURTHB': { price: 38.90, symbol: 'EURTHB', name: 'EUR/THB', currency: 'THB' },
  'CNYTHB': { price: 4.85, symbol: 'CNYTHB', name: 'CNY/THB', currency: 'THB' },
};

export default function StressTester() {
  const [selectedScenario, setSelectedScenario] = useState<StressScenario | null>(null);
  const [monthlyVolume, setMonthlyVolume] = useState<{[key: string]: number}>({
    'WTI': 1000,      // barrels
    'SUGAR': 500,     // tons
    'COPPER': 100,    // tons
    'USDTHB': 50000,  // USD
    'EURTHB': 30000,  // EUR
    'CNYTHB': 200000, // CNY
  });

  const calculateImpact = (scenario: StressScenario): CostImpact[] => {
    return Object.keys(CURRENT_PRICES).map(commodity => {
      const current = CURRENT_PRICES[commodity as keyof typeof CURRENT_PRICES];
      const impactFactor = scenario.impactFactors[commodity] || 1;
      const stressedPrice = current.price * impactFactor;
      const volume = monthlyVolume[commodity] || 0;
      const costIncrease = (stressedPrice - current.price) * volume;
      
      return {
        commodity,
        currentPrice: current.price,
        stressedPrice,
        impact: (impactFactor - 1) * 100,
        costIncrease
      };
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-yellow-200 bg-yellow-50';
      case 'medium': return 'border-orange-200 bg-orange-50';
      case 'high': return 'border-red-200 bg-red-50';
      case 'extreme': return 'border-red-300 bg-red-100';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-yellow-800';
      case 'medium': return 'text-orange-800';
      case 'high': return 'text-red-800';
      case 'extreme': return 'text-red-900';
      default: return 'text-gray-800';
    }
  };

  const totalCostImpact = selectedScenario 
    ? calculateImpact(selectedScenario).reduce((sum, item) => sum + item.costIncrease, 0)
    : 0;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${inter.className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Calculator className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Market Stress Tester</h1>
        </div>
        <p className="text-gray-600">
          จำลองผลกระทบจากวิกฤติต่าง ๆ ต่อต้นทุนจัดซื้อและวางแผนรับมือล่วงหน้า
        </p>
      </div>

      {/* Monthly Volume Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Procurement Volume</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(CURRENT_PRICES).map(commodity => {
            const info = CURRENT_PRICES[commodity as keyof typeof CURRENT_PRICES];
            return (
              <div key={commodity}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {info.name}
                </label>
                <input
                  type="number"
                  value={monthlyVolume[commodity]}
                  onChange={(e) => setMonthlyVolume(prev => ({
                    ...prev,
                    [commodity]: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">เลือกสถานการณ์วิกฤติ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRESS_SCENARIOS.map(scenario => (
            <div
              key={scenario.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedScenario?.id === scenario.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : getSeverityColor(scenario.severity)
              }`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <div className="flex items-start space-x-3">
                <div className={selectedScenario?.id === scenario.id ? 'text-blue-600' : getSeverityTextColor(scenario.severity)}>
                  {scenario.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityTextColor(scenario.severity)} ${getSeverityColor(scenario.severity)}`}>
                      {scenario.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedScenario && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ผลกระทบจาก "{selectedScenario.name}"
          </h2>
          
          {/* Total Impact Summary */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-900">Total Monthly Cost Impact</h3>
                <p className="text-sm text-red-700">Additional cost per month during crisis</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-900">
                  {totalCostImpact >= 0 ? '+' : ''}
                  ฿{Math.abs(totalCostImpact).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-red-700">per month</div>
              </div>
            </div>
          </div>

          {/* Detailed Impact by Commodity */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Commodity</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Current Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Stressed Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">% Change</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Cost Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {calculateImpact(selectedScenario).map((impact, index) => {
                  const info = CURRENT_PRICES[impact.commodity as keyof typeof CURRENT_PRICES];
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{info.name}</div>
                        <div className="text-sm text-gray-500">{info.symbol}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900">
                        {info.currency} {impact.currentPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={impact.impact >= 0 ? 'text-red-600' : 'text-green-600'}>
                          {info.currency} {impact.stressedPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={impact.impact >= 0 ? 'text-red-600' : 'text-green-600'}>
                          {impact.impact >= 0 ? '+' : ''}{impact.impact.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={impact.costIncrease >= 0 ? 'text-red-600' : 'text-green-600'}>
                          {impact.costIncrease >= 0 ? '+' : ''}฿{Math.abs(impact.costIncrease).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Emergency Action Plan */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🚨 Emergency Action Plan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• เร่งสั่งซื้อ forward contracts สำหรับสินค้าที่ราคาขึ้นมาก</li>
              <li>• ปรับแผนงบประมาณเพิ่ม ฿{Math.abs(totalCostImpact * 3).toLocaleString()} สำหรับ 3 เดือนแรก</li>
              <li>• ติดต่อ alternative suppliers ในภูมิภาคเอเชีย</li>
              <li>• พิจารณา hedging strategies สำหรับ currency exposure</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}