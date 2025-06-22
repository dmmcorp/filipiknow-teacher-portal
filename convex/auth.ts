import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const CustomPassword = Password({
  profile(params) {
    return {
      email: params.email as string,
      fname: params.fname as string,
      lname: params.lname as string,
      mname: params.mname as string,
      image: params.image !== undefined ? params.image as string : null,
      role: params.role as "teacher" | "student",
      licenseNumber: params.licenseNumber as string,
      gradeLevel: params.gradeLevel as string,
      isActive: true,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword],
});
