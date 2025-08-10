'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { ChevronDown } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

export const UserDropdown = () => {
  const current = useQuery(api.users.current);
  const { signOut } = useAuthActions();

  if (current === undefined) return <div>Loading....</div>;

  const fullName = current?.fname + ' ' + current?.lname;

  const handleSignOut = async () => {
    await signOut();

    window.location.href = '/';
  };
  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <div className="flex gap-3 items-center">
            <Avatar className="w-[40px] h-[40px]">
              <AvatarImage
                src={current?.imageUrl as string}
                alt={current?.fname}
                width={54}
                height={54}
              />
              <AvatarFallback className="">{fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{fullName}</p>
            <ChevronDown className="w-5 h-5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
