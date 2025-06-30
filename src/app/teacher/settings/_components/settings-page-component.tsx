"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { AccountInformation } from "./account-information";
import { SecurityInformation } from "./security-information";

export const SettingsPageComponent = () => {
  const current = useQuery(api.users.current);
  const [activeTab, setActiveTab] = useState("account");

  if (current === undefined) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <div className="flex justify-end p-4">
        <UserDropdown />
      </div> */}

      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">SETTINGS</h1>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardContent>
            <div className="flex justify-around">
              <button
                onClick={() => setActiveTab("account")}
                className={cn(
                  "px-6 py-3 font-medium text-sm transition-colors rounded-md cursor-pointer",
                  activeTab === "account"
                    ? "bg-[#E3E3E3]"
                    : "border border-gray-300 hover:text-gray-700"
                )}
              >
                Account Information
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={cn(
                  "px-6 py-3 font-medium text-sm transition-colors rounded-md cursor-pointer",
                  activeTab === "security"
                    ? "bg-[#E3E3E3]"
                    : "border border-gray-300 hover:text-gray-700"
                )}
              >
                Login & Security
              </button>
            </div>

            <Separator className="my-5 bg-gray-500" />

            {/* Account Information Tab */}
            <AccountInformation activeTab={activeTab} current={current} />

            {/* Login & Security Tab */}
            <SecurityInformation activeTab={activeTab} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
