'use client';

import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { useState } from 'react';
import { Sarabun } from 'next/font/google';
import SearchBar from '@/components/search/SearchBar';

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
})

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigationItems = [
    { name: 'Markets', href: '/' },
    { name: 'Stress Test', href: '/stress-test' },
    { name: 'Economics', href: '/economics' },
    { name: 'News', href: '/news' },
    { name: 'Analysis', href: '/analysis' },
  ];

  return (
    <header className={`bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-50 ${inter.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-blue-600/90 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-xs">MP</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-gray-900">MarketPulse</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-2 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:block">
              <SearchBar className="w-80" />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden lg:block text-sm font-medium">Account</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow py-1 z-10 border border-gray-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/watchlist"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Watchlist
                  </Link>
                  <hr className="border-gray-200 my-1" />
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Subscribe Button */}
            <button className="hidden sm:inline-flex items-center px-3.5 py-1.5 border border-blue-600 text-sm font-medium rounded-sm text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar className="w-full" />
      </div>
    </header>
  );
}