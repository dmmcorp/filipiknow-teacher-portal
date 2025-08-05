/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './logo';
import { NavGroupItems } from './nav-group-items';
import { teacherNavItems } from './nav-items';
import { Button } from './ui/button';

export function TeacherSideNav({
  header = 'Teacher Portal',
  value = 'teacher',
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  header?: string;
  value?: 'teacher' | 'student';
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { user } = useCurrentUser();

  if (!user) return null;

  const SidebarContents = () => (
    <div
      className={cn(isMobile ? 'mt-0' : ' mt-16', 'bg-[#c6986b]')}
      style={{ height: `calc(100vh - var(--header-height))` }}
    >
      <SidebarContent className="flex-1 overflow-y-auto ">
        <NavGroupItems items={teacherNavItems} groupLabel="" />
      </SidebarContent>
    </div>
  );

  return (
    <div className="mt-16  max-h-[50vh] bg-[#c6986b] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block z-30 bg-[#c6986b]  relative">
        <Sidebar collapsible="icon" {...props} className="bg-[#c6986b] z-30">
          <SidebarContents />
          <SidebarRail />
        </Sidebar>
      </div>

      {/* Mobile Sheet */}
      <div
        className={cn(
          'md:hidden fixed top-3 left-4 z-50 bg-[#c6986b] text-white'
        )}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="p-0 w-[300px] z-[9999] bg-[#c6986b] text-white"
          >
            <SheetHeader className="text-white text-center p-5">
              <Link href="/" className="flex items-center gap-2 text-center">
                <Logo />
              </Link>
            </SheetHeader>
            <SidebarContents />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
