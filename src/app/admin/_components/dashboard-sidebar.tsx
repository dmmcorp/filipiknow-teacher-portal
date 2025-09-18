'use client';

import { cn } from '@/lib/utils';
import {
  BookOpen,
  ChevronDown,
  FileQuestion,
  Home,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const Sidebar = () => {
  const [isClassOpen, setIsClassOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/teacher',
      active: pathname === '/teacher',
    },
    {
      icon: BookOpen,
      label: 'Class',
      hasDropdown: true,
      isOpen: isClassOpen,
      onClick: () => setIsClassOpen(!isClassOpen),
    },
    {
      icon: FileQuestion,
      label: 'Quiz',
      href: '/teacher/quizzes',
      active: pathname === '/teacher/quizzes',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/teacher/settings',
      active: pathname === '/teacher/settings',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-orange-500">FilipiKnow</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                    item.active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className={cn(
                    'cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                    item.active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.hasDropdown && (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        item.isOpen && 'rotate-180'
                      )}
                    />
                  )}
                </button>
              )}

              {/* Dropdown content for Class */}
              {item.hasDropdown && item.isOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    All Classes
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    Create Class
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
