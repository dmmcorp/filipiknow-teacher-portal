'use client';

import { AuthFlow } from '@/lib/types';
import { useConvexAuth } from 'convex/react';
import Image from 'next/image';
import { useState } from 'react';
import { LoginCard } from './log-in-card';
import { RegisterCard } from './register-card';
import { RoleCheck } from './role-check';

export const AuthScreen = () => {
  const [state, setState] = useState<AuthFlow>('signIn');
  const { isAuthenticated } = useConvexAuth();

  if (isAuthenticated) {
    return <RoleCheck />;
  }

  return (
    <>
      {state === 'signIn' ? (
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
      ) : (
        <div className="p-5">
          <div className="mb-[80px] md:mb-0">
            <Image
              src="/images/logo.svg"
              alt="logo image"
              height={43.53}
              width={211}
            />
          </div>
          <RegisterCard setState={setState} />
        </div>
      )}
    </>
  );
};
