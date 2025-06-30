import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FunctionReturnType } from "convex/server";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";

type CurrentUserType = FunctionReturnType<typeof api.users.current>;

interface AccountInformationProps {
  activeTab: string;
  current: CurrentUserType;
}

export const AccountInformation = ({
  activeTab,
  current,
}: AccountInformationProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fullName = `${current?.fname} ${current?.lname}`;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <>
      {activeTab === "account" && (
        <div className="border-0">
          <div className="p-8">
            {/* Profile Picture Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Profile Picture
              </h3>
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 cursor-pointer">
                  <AvatarImage
                    src={(current?.imageUrl as string) || "/placeholder.svg"}
                    alt={current?.fname}
                  />
                  <AvatarFallback className="text-2xl">
                    {current?.fname?.charAt(0)}
                    {current?.lname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-3">
                  <Button>Upload New</Button>
                  <Button variant="outline">Remove Profile Picture</Button>
                </div>
              </div>
            </div>

            <Separator className="my-5 bg-gray-500" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  defaultValue={fullName}
                  className="bg-white"
                />
              </div>

              {/* Teaching License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Teaching License Number</Label>
                <Input
                  id="licenseNumber"
                  placeholder="e.g. 12345678"
                  className="bg-white"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    defaultValue={current?.email || ""}
                    className="bg-white pr-20"
                  />
                  <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Upload Certifications */}
              <div className="space-y-2">
                <Label htmlFor="certifications">Upload Certifications</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="relative overflow-hidden bg-transparent"
                  >
                    <input
                      type="file"
                      id="certifications"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    Choose File
                  </Button>
                  <span className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : "No file chosen"}
                  </span>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end mt-8">
              <Button>Update Profile</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
