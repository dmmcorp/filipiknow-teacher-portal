import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FunctionReturnType } from "convex/server";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

type CurrentUserType = FunctionReturnType<typeof api.users.current>;

interface AccountInformationProps {
  activeTab: string;
  current: CurrentUserType;
}

const accountSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  licenseNumber: z.string().optional(),
  email: z.string().email("Invalid email"),
  certification: z.any().optional(),
  image: z.any().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export const AccountInformation = ({
  activeTab,
  current,
}: AccountInformationProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    current?.imageUrl ?? null
  );
  const [imageStorageId, setImageStorageId] = useState<string | null>(
    current?.image ?? null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const editAccount = useMutation(api.users.editAccountInformation);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      fname: current?.fname || "",
      lname: current?.lname || "",
      licenseNumber: current?.licenseNumber || "",
      email: current?.email || "",
    },
  });

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Image upload failed");
      const { storageId } = await result.json();
      setImageStorageId(storageId);
      toast.success("Profile image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
      setPreviewImage(current?.imageUrl ?? null);
      setImageStorageId(current?.image ?? null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setValue("certification", file);
  };

  const onSubmit = async (data: AccountFormValues) => {
    setIsUpdatingProfile(true);
    try {
      await editAccount({
        userId: current?._id as Id<"users">,
        fname: data.fname,
        lname: data.lname,
        licenseNumber: data.licenseNumber,
        email: data.email,
        certification: selectedFile ? selectedFile.name : undefined,
        image: imageStorageId ?? undefined,
      });

      toast.success("Account updated!");
    } catch (error) {
      toast.error("Error updating account. Please try again later");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <>
      {activeTab === "account" && (
        <div className="border-0">
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Profile Picture Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Your Profile Picture
                </h3>
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 cursor-pointer">
                    <AvatarImage
                      src={previewImage || "/placeholder.svg"}
                      alt={current?.fname}
                    />
                    <AvatarFallback className="text-2xl">
                      {current?.fname?.charAt(0)}
                      {current?.lname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3 items-center">
                    <Button type="button" asChild disabled={isUploadingImage}>
                      <label>
                        Upload New
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={isUploadingImage}
                        />
                      </label>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewImage(null);
                        setImageStorageId(null);
                      }}
                      disabled={isUploadingImage}
                    >
                      Remove Profile Picture
                    </Button>
                    {isUploadingImage && (
                      <div className="flex items-center gap-2 ml-2">
                        <Loader2Icon className="h-5 w-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Uploading...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-5 bg-gray-500" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fname">First name</Label>
                  <Input
                    id="fname"
                    {...register("fname")}
                    className="bg-white"
                  />
                  {errors.fname && (
                    <span className="text-red-500 text-xs">
                      {errors.fname.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">Last name</Label>
                  <Input
                    id="lname"
                    {...register("lname")}
                    className="bg-white"
                  />
                  {errors.lname && (
                    <span className="text-red-500 text-xs">
                      {errors.lname.message}
                    </span>
                  )}
                </div>

                {/* Teaching License Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Teaching License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="e.g. 12345678"
                    {...register("licenseNumber")}
                    className="bg-white"
                  />
                  {errors.licenseNumber && (
                    <span className="text-red-500 text-xs">
                      {errors.licenseNumber.message}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="bg-white pr-20"
                    />
                    <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckIcon className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Upload Certifications */}
                <div className="space-y-2">
                  <Label htmlFor="certifications">Upload Certifications</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
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
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || isUploadingImage || isUpdatingProfile
                  }
                >
                  {isSubmitting || isUpdatingProfile ? (
                    <span className="flex items-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
