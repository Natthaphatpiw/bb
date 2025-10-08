'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
});

interface NewsScore {
  region: string;
  score: number;
  reason: string;
}

interface NewsItem {
  newsId: string;
  title: string;
  summary: string;
  publishedDate: string;
  imageUrl: string;
  link: string;
  scores: NewsScore[];
  market?: string;
}

interface LatestNewsSectionProps {
  maxItems?: number;
}

export default function LatestNewsSection({ maxItems = 5 }: LatestNewsSectionProps) {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/data/all_markets.json');
        const data = await response.json();

        // รวมข่าวจากทุกตลาด
        const newsItems: NewsItem[] = [];

        Object.keys(data.data).forEach((marketKey) => {
          const marketData = data.data[marketKey];
          if (marketData.news && marketData.news.news) {
            marketData.news.news.forEach((newsItem: NewsItem) => {
              newsItems.push({
                ...newsItem,
                market: marketData.market,
              });
            });
          }
        });

        // เรียงตามวันที่เผยแพร่ (ใหม่สุดก่อน)
        newsItems.sort((a, b) =>
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        );

        // เอาแค่ n ข่าวล่าสุด
        setAllNews(newsItems.slice(0, maxItems));
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, [maxItems]);

  const getRegionScore = (scores: NewsScore[], region: string) => {
    const score = scores.find(s => s.region === region);
    return score ? score.score : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-danger-600 bg-danger-100';
    if (score >= 50) return 'text-warning-600 bg-warning-100';
    return 'text-success-600 bg-success-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className={`mb-12 ${sarabun.className}`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest news, commentaries and reports</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="lg:col-span-2 bg-gray-200 rounded-2xl h-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (allNews.length === 0) {
    return null;
  }

  const [featuredNews, ...otherNews] = allNews;

  return (
    <section className={`mb-12 ${sarabun.className}`}>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest news, commentaries and reports</h2>

      <div className="space-y-6">
        {/* ข่าวใหญ่สุด (Featured News) */}
        <Link
          href={featuredNews.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group animate-fade-in"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* รูปภาพด้านซ้าย */}
              <div className="relative h-80 lg:h-auto overflow-hidden">
                <Image
                  src={featuredNews.imageUrl}
                  alt={featuredNews.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* เนื้อหาด้านขวา */}
              <div className="p-6 lg:p-8 flex flex-col justify-between">
                <div>
                  {/* Tag and Date */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-full uppercase shadow-sm">
                      {featuredNews.market}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(featuredNews.publishedDate)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight">
                    {featuredNews.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-600 text-base lg:text-lg mb-6 leading-relaxed">
                    {featuredNews.summary}
                  </p>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Global</div>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block shadow-sm ${getScoreColor(getRegionScore(featuredNews.scores, 'global'))}`}>
                      {getRegionScore(featuredNews.scores, 'global')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Asia</div>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block shadow-sm ${getScoreColor(getRegionScore(featuredNews.scores, 'asia'))}`}>
                      {getRegionScore(featuredNews.scores, 'asia')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Thailand</div>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block shadow-sm ${getScoreColor(getRegionScore(featuredNews.scores, 'thailand'))}`}>
                      {getRegionScore(featuredNews.scores, 'thailand')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 4 ข่าวเล็ก */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherNews.map((news, index) => (
            <Link
              key={news.newsId}
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border border-gray-100 animate-slide-up">
                {/* รูปภาพ */}
                <div className="relative h-48 overflow-hidden">
                  {news.imageUrl ? (
                    <Image
                      src={news.imageUrl}
                      alt={news.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <span className="text-primary-400 text-4xl">📰</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* เนื้อหา */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Tag and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-2 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold rounded uppercase shadow-sm">
                      {news.market}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(news.publishedDate)}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-gray-900 mb-3 line-clamp-3 group-hover:text-primary-600 transition-colors flex-1 leading-snug">
                    {news.title}
                  </h4>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                      <div className="text-[10px] text-gray-600 font-semibold uppercase mb-1">Global</div>
                      <div className={`text-sm font-bold px-2 py-0.5 rounded inline-block shadow-sm ${getScoreColor(getRegionScore(news.scores, 'global'))}`}>
                        {getRegionScore(news.scores, 'global')}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                      <div className="text-[10px] text-gray-600 font-semibold uppercase mb-1">Asia</div>
                      <div className={`text-sm font-bold px-2 py-0.5 rounded inline-block shadow-sm ${getScoreColor(getRegionScore(news.scores, 'asia'))}`}>
                        {getRegionScore(news.scores, 'asia')}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                      <div className="text-[10px] text-gray-600 font-semibold uppercase mb-1">TH</div>
                      <div className={`text-sm font-bold px-2 py-0.5 rounded inline-block shadow-sm ${getScoreColor(getRegionScore(news.scores, 'thailand'))}`}>
                        {getRegionScore(news.scores, 'thailand')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Events Sidebar (Optional - ถ้าต้องการ) */}
      {/* <div className="mt-6 lg:absolute lg:right-0 lg:top-0 lg:w-64">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Events</h3>
            <button className="text-sm text-primary-600 font-semibold hover:text-primary-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            // Event items here
          </div>
        </div>
      </div> */}
    </section>
  );
}
