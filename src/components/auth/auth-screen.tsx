"use client";

import { AuthFlow } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { LoginCard } from "./log-in-card";

export const AuthScreen = () => {
  const [state, setState] = useState<AuthFlow>("signIn");

  return (
    <div className="h-full w-full mx-auto my-[100px]">
      <div className="w-full flex flex-col items-center space-y-5">
        <Image
          src="/images/logo.svg"
          alt="logo image"
          height={76}
          width={368}
        />
        <Image
          src="/images/school-logo.svg"
          alt="school logo image"
          height={155}
          width={155}
        />

        <LoginCard setState={setState} />
      </div>
    </div>
  );
};
