import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";

interface SecurityInformationProps {
  activeTab: string;
}

export const SecurityInformation = ({
  activeTab,
}: SecurityInformationProps) => {
  return (
    <>
      {activeTab === "security" && (
        <div className="border-0">
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">SMS Authentication</p>
                    <p className="text-sm text-gray-500">
                      Receive codes via SMS
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-black hover:bg-gray-800 text-white px-8">
                  Update Security Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
