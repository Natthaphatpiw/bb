'use client';

import { NewsArticle } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { ExternalLink, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Sarabun } from 'next/font/google';
import Button from '@/components/ui/Button';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

interface NewsGridProps {
  articles: NewsArticle[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function NewsGrid({
  articles,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: NewsGridProps) {
  if (isLoading) {
    return <NewsGridSkeleton />;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No recent news articles available</p>
          <p className="text-xs mt-1">Check back later for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${inter.className}`}>
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface NewsCardProps {
  article: NewsArticle;
}

function NewsCard({ article }: NewsCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      Markets: 'bg-blue-100 text-blue-800',
      Energy: 'bg-orange-100 text-orange-800',
      Currencies: 'bg-green-100 text-green-800',
      Economics: 'bg-purple-100 text-purple-800',
      World: 'bg-gray-100 text-gray-800',
      'Personal-finance': 'bg-indigo-100 text-indigo-800',
      'Climate-politics': 'bg-emerald-100 text-emerald-800',
      'Politics-policy': 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || colors.Markets;
  };

  return (
    <article className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 ${inter.className}`}>
      {/* Image */}
      {article.imageUrl && (
        <div className={`aspect-video relative overflow-hidden bg-gray-100 ${inter.className}`}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide broken images
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className={`p-4 ${inter.className}`}>
        {/* Category and Time */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-base font-medium text-gray-900 line-clamp-2 mb-2 leading-tight ${inter.className}`}>
          <Link 
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </Link>
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className={`text-sm text-gray-600 line-clamp-3 mb-3 ${inter.className}`}>
            {article.summary}
          </p>
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between ${inter.className}`}>
          <span className="text-xs text-gray-500 font-medium">
            {article.source}
          </span>
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Read more
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function NewsGridSkeleton() {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${inter.className}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}