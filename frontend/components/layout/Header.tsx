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
    <header className={`bg-white/98 backdrop-blur-md border-b-2 border-primary-100 sticky top-0 z-50 shadow-soft ${inter.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-glow-primary transition-all duration-300">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                MarketPulse
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden sm:block">
              <SearchBar className="w-80" />
            </div>

            {/* Notifications */}
            <button className="p-2.5 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all duration-200">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="hidden lg:block text-sm font-semibold">Account</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-hard py-2 z-10 border border-gray-100">
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/watchlist"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    Watchlist
                  </Link>
                  <hr className="border-gray-200 my-2" />
                  <button className="block w-full text-left px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors">
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Subscribe Button */}
            <button className="hidden sm:inline-flex items-center px-5 py-2.5 bg-gradient-accent text-white text-sm font-bold rounded-lg shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-300">
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