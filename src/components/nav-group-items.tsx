'use client';

import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export function NavGroupItems({
  items,
  groupLabel,
}: {
  items: {
    label: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      label: string;
      href: string;
    }[];
  }[];
  groupLabel: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {groupLabel !== '' && (
        <SidebarGroupLabel className="capitalize text-muted-foreground text-lg">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => {
          return (
            <SidebarMenuItem key={item.label} className="relative">
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                className={cn(
                  'text-sm group relative flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition',
                  pathname === item.href
                    ? 'bg-brand-orange text-white hover:bg-brand-orange'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Link href={item.href} className="relative">
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
