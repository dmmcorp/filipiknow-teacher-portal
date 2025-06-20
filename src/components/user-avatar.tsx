"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaSpinner } from "react-icons/fa";
import { Button } from "./ui/button";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function UserAvatar() {
  const { user, isLoading } = useCurrentUser();
  const { signOut } = useAuthActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <FaSpinner className="text-4xl animate-spin text-orange-500 mb-2" />
          <span className="text-lg font-medium text-gray-700">
            Loading please wait...
          </span>
        </div>
      </div>
    );
  }

  return user ? (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.image || "/placeholder.svg"} alt="User" />
      <AvatarFallback className="bg-gray-800 text-white">
        {user.fname.charAt(0)} {user.lname.charAt(0)}
      </AvatarFallback>
    </Avatar>
  ) : (
    <Link href={"/auth"}>
      <Button className="">Sign In</Button>
    </Link>
  );
}
