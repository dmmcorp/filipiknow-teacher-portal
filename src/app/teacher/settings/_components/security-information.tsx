import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { FunctionReturnType } from "convex/server";
import { Id } from "../../../../../convex/_generated/dataModel";

type CurrentUserType = FunctionReturnType<typeof api.users.current>;

interface SecurityInformationProps {
  activeTab: string;
  current: CurrentUserType;
}

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .optional(),
    confirmPassword: z.string().optional(),
    email: z.string().email("Invalid email"),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be 10 digits")
      .optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type SecurityFormValues = z.infer<typeof securitySchema>;

export const SecurityInformation = ({
  activeTab,
  current,
}: SecurityInformationProps) => {
  const updateSecurity = useMutation(api.users.updateSecurityInformation);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      email: current?.email || "",
      phoneNumber: current?.phoneNumber || "",
    },
  });

  const onSubmit = async (data: SecurityFormValues) => {
    try {
      await updateSecurity({
        userId: current?._id as Id<"users">,
        // currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      toast.success("Security information updated!");
      reset();
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: string }).data === "string"
      ) {
        toast.error((error as { data: string }).data);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update security information");
      }
    }
  };

  return (
    <>
      {activeTab === "security" && (
        <div className="border-0">
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-white"
                        {...register("currentPassword")}
                      />
                      {errors.currentPassword && (
                        <span className="text-red-500 text-xs">
                          {errors.currentPassword.message}
                        </span>
                      )}
                    </div> */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="bg-white"
                        {...register("newPassword")}
                      />
                      {errors.newPassword && (
                        <span className="text-red-500 text-xs">
                          {errors.newPassword.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailInput">Email Address</Label>
                      <Input
                        id="emailInput"
                        type="email"
                        className="bg-white"
                        {...register("email")}
                      />
                      {errors.email && (
                        <span className="text-red-500 text-xs">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="bg-white"
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <span className="text-red-500 text-xs">
                          {errors.confirmPassword.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none select-none">
                          +63&nbsp;|
                        </span>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          className="bg-white pl-15"
                          placeholder="9179615399"
                          maxLength={10}
                          {...register("phoneNumber")}
                        />
                        {errors.phoneNumber && (
                          <span className="text-red-500 text-xs">
                            {errors.phoneNumber.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
