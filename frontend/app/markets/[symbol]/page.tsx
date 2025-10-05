'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import PriceChart from '@/components/charts/PriceChart';
import AIInsights from '@/components/market/AIInsights';
import NewsGrid from '@/components/market/NewsGrid';
import Button from '@/components/ui/Button';
import { getAssetDetail, getChartData, getAIInsights, getRelatedNews } from '@/lib/api';
import { AssetDetailResponse, TimeRange, AIInsight, NewsArticle, ChartDataPoint } from '@/lib/types';
import { formatCurrency, formatPercentage, getPriceChangeDirection, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { Sarabun } from 'next/font/google';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;

  // State management
  const [assetData, setAssetData] = useState<AssetDetailResponse | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotalPages, setNewsTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [aiError, setAIError] = useState<string | null>(null);

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1D');
  const [isFollowing, setIsFollowing] = useState(false);

  // Load initial asset data
  useEffect(() => {
    async function loadAssetDetail() {
      if (!symbol) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await getAssetDetail(symbol);
        setAssetData(data);
        setChartData(data.chartData);

        if (data.aiInsights) {
          setAIInsights(data.aiInsights);
        }

        // Load news separately with pagination
        loadNews(1);
      } catch (err) {
        console.error('Failed to load asset detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to load asset data');
      } finally {
        setIsLoading(false);
      }
    }

    loadAssetDetail();
  }, [symbol]);

  // Load news with pagination
  const loadNews = async (page: number) => {
    if (!symbol) return;

    try {
      setNewsLoading(true);
      const newsData = await getRelatedNews(symbol, page, 5);
      setNews(newsData.articles);
      setNewsPage(page);
      setNewsTotalPages(Math.ceil(newsData.total / 5));
    } catch (err) {
      console.error('Failed to load news:', err);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleNewsPageChange = (page: number) => {
    loadNews(page);
  };

  // Load chart data when time range changes
  useEffect(() => {
    async function loadChartData() {
      if (!symbol || selectedTimeRange === '1D') return; // 1D data comes with initial load

      try {
        setChartLoading(true);
        const data = await getChartData(symbol, selectedTimeRange);
        setChartData(data);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setChartLoading(false);
      }
    }

    loadChartData();
  }, [symbol, selectedTimeRange]);

  // Load AI insights separately (they might take longer)
  useEffect(() => {
    async function loadAIInsights() {
      if (!symbol) return;

      try {
        setAILoading(true);
        setAIError(null);
        const insights = await getAIInsights(symbol);
        if (insights) {
          setAIInsights(insights);
        } else {
          setAIError('AI insights temporarily unavailable for this asset');
        }
      } catch (err) {
        console.error('Failed to load AI insights:', err);
        setAIError(err instanceof Error ? err.message : 'Failed to load AI insights');
      } finally {
        setAILoading(false);
      }
    }

    // Load AI insights with a slight delay
    const timer = setTimeout(loadAIInsights, 500);
    return () => clearTimeout(timer);
  }, [symbol]);

  const handleRefresh = async () => {
    // Refresh all data
    window.location.reload();
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API call
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };

  if (isLoading) {
    return <AssetDetailSkeleton />;
  }

  if (error || !assetData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <h1 className="text-2xl font-bold">Asset Not Found</h1>
            <p className="mt-2">{error || 'The requested asset could not be loaded.'}</p>
          </div>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const direction = getPriceChangeDirection(assetData.change);
  const priceChangeColor = direction === 'up' ? 'text-green-600' : direction === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${inter.className}`}>
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>
      </div>

      {/* Asset Header */}
      <div className="bg-white border-b border-gray-200 rounded-lg mb-6">
        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            {/* Left section - Asset info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assetData.name}</h1>
              <p className="text-gray-600 mt-1">
                {assetData.symbol} ({assetData.currency}/{assetData.assetType})
              </p>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant={isFollowing ? 'secondary' : 'primary'} 
                size="sm"
                onClick={handleFollowToggle}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>

          {/* Price Information */}
          <div className="mt-6">
            <div className="flex items-baseline space-x-4">
              <span className="text-5xl font-bold text-gray-900">
                {formatCurrency(assetData.price, assetData.currency)}
              </span>
              <div className={`flex items-center ${priceChangeColor}`}>
                <span className="text-xl font-medium">
                  {assetData.change >= 0 ? '+' : ''}{formatCurrency(assetData.change, assetData.currency)}
                </span>
                <span className="ml-2 text-xl">
                  ({formatPercentage(assetData.changePercent)})
                </span>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              As of {formatDateTime(assetData.lastUpdated, { includeSeconds: true })} EDT
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="news">Related News</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          {/* Price Chart */}
          <div className="mb-8">
            {chartLoading ? (
              <ChartSkeleton />
            ) : (
              <PriceChart
                data={chartData}
                symbol={assetData.symbol}
                currency={assetData.currency}
                timeRange={selectedTimeRange}
                onTimeRangeChange={handleTimeRangeChange}
                showNews={true}
              />
            )}
          </div>

          {/* Overview Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">OPEN</div>
                <div className="text-lg font-semibold text-gray-900">
                  {assetData.open ? formatCurrency(assetData.open, assetData.currency) : '--'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">VOLUME</div>
                <div className="text-lg font-semibold text-gray-900">
                  {assetData.volume ? assetData.volume.toLocaleString() : '--'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">52 WEEK RANGE</div>
                <div className="text-lg font-semibold text-gray-900">
                  {assetData.week52Low && assetData.week52High 
                    ? `${formatCurrency(assetData.week52Low, assetData.currency)} – ${formatCurrency(assetData.week52High, assetData.currency)}`
                    : '--'
                  }
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">PREV. CLOSE</div>
                <div className="text-lg font-semibold text-gray-900">
                  {assetData.prevClose ? formatCurrency(assetData.prevClose, assetData.currency) : '--'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">DAY RANGE</div>
                <div className="text-lg font-semibold text-gray-900">
                  {assetData.low && assetData.high 
                    ? `${formatCurrency(assetData.low, assetData.currency)} – ${formatCurrency(assetData.high, assetData.currency)}`
                    : '--'
                  }
                </div>
              </div>

              {assetData.marketCap && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">MARKET CAP</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(assetData.marketCap, assetData.currency, 0, 0)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <AIInsights
            insights={aiInsights}
            isLoading={aiLoading}
            error={aiError}
            currentPrice={assetData.price}
            currency={assetData.currency}
          />
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Related News</h3>
            <NewsGrid
              articles={news}
              isLoading={newsLoading}
              currentPage={newsPage}
              totalPages={newsTotalPages}
              onPageChange={handleNewsPageChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading skeleton for the entire page
function AssetDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Back button skeleton */}
        <div className="h-8 w-32 bg-gray-200 rounded mb-6" />
        
        {/* Header skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex space-x-3">
              <div className="h-8 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          
          <div className="mt-6">
            <div className="h-12 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
        </div>
        
        {/* Tabs skeleton */}
        <div className="flex space-x-1 mb-6">
          <div className="h-10 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-24 bg-gray-200 rounded" />
        </div>
        
        {/* Chart skeleton */}
        <ChartSkeleton />
      </div>
    </div>
  );
}