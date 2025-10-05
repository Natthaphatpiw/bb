'use client';

import { useState, useEffect } from 'react';
import { NewsScore } from '@/lib/realDataApi';
import Image from 'next/image';

interface NewsFeedProps {
  newsItems: NewsScore[];
  itemsPerPage?: number;
}

export default function NewsFeed({ newsItems, itemsPerPage = 5 }: NewsFeedProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // เรียงข่าวตามวันที่ล่าสุดไปเก่าสุด
  const sortedNews = [...newsItems].sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime();
    const dateB = new Date(b.publishedDate).getTime();
    return dateB - dateA; // ล่าสุดก่อน (descending)
  });

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = sortedNews.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-700 bg-red-100';
    if (score >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-4">
      {/* News Items */}
      <div className="space-y-4">
        {currentNews.map((news, index) => {
          const globalScore = news.scores.find(s => s.region === 'global')?.score || 0;
          const asiaScore = news.scores.find(s => s.region === 'asia')?.score || 0;
          const thaiScore = news.scores.find(s => s.region === 'thailand')?.score || 0;

          return (
            <div
              key={news.newsId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-24 bg-gray-100 rounded overflow-hidden relative">
                    {news.imageUrl && news.imageUrl !== '' ? (
                      <Image
                        src={news.imageUrl}
                        alt={news.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {news.title}
                    </a>
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {news.summary}
                  </p>

                  {/* Date */}
                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(news.publishedDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Impact Scores */}
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-gray-500">Impact Score:</span>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Global:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getScoreColor(globalScore)}`}>
                        {globalScore}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Asia:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getScoreColor(asiaScore)}`}>
                        {asiaScore}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Thailand:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getScoreColor(thaiScore)}`}>
                        {thaiScore}
                      </span>
                    </div>
                  </div>

                  {/* Reasons (collapsible) */}
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                      ดูเหตุผลการให้คะแนน
                    </summary>
                    <div className="mt-2 space-y-1 text-xs text-gray-600 pl-4">
                      {news.scores.map((score, idx) => (
                        <div key={idx}>
                          <span className="font-semibold capitalize">{score.region}:</span> {score.reason}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            หน้า {currentPage} จาก {totalPages} ({sortedNews.length} ข่าวทั้งหมด)
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← ก่อนหน้า
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
