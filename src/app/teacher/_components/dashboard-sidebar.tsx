'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import {
  BookOpen,
  ChevronDown,
  FileQuestion,
  Home,
  Loader2Icon,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export const Sidebar = () => {
  const { user, isLoading } = useCurrentUser();
  const userSections = useQuery(api.sections.getSectionsByUserId, {
    userId: user?._id as Id<'users'>,
  });
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

  if (isLoading) {
    return (
      <div className="w-64 bg-background border-r border-orange-700/20 flex items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="w-64 bg-background border-r border-orange-700/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-orange-700/20">
        <h1 className="text-xl font-bold text-white">FilipiKnow</h1>
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
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-orange-100 hover:bg-white/10 hover:text-white'
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
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-orange-100 hover:bg-white/10 hover:text-white'
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
                  {userSections?.map((section) => (
                    <Link
                      key={section._id}
                      href={`/teacher/sections/${section._id}`}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        pathname === `/teacher/sections/${section._id}`
                          ? 'bg-white/20 text-white font-medium'
                          : 'text-orange-100 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {section.name}
                    </Link>
                  ))}
                  {!userSections?.length && (
                    <p className="text-sm text-orange-200 px-3 py-2">
                      No sections assigned
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
