'use client';

import Logo from '@/components/logo';
import { LoginCard } from './log-in-card';

export const AuthScreen = () => {
  // if (isAuthenticated) {
  //   return <RoleCheck />;
  // }

  return (
    <div className="h-screen w-full lg:flex lg:flex-row">
      <div className="hidden lg:w-[50%] bg-zinc-50 lg:flex lg:flex-col lg:justify-center lg:items-center text-white ">
        <div className="w-full h-full  flex flex-col items-center justify-center md:px-20 xl:px-52">
          <h1 className="text-3xl font-bold leading-tight w-full text-black">
            <Logo />
          </h1>
        </div>

        <div className="text-lg font-medium flex flex-col justify-center items-center mt-auto mb-[60px] text-black"></div>
      </div>
      <div className="h-full w-full  lg:w-[50%] flex flex-col flex-1 items-center justify-center bg-background">
        <div className="md:h-auto w-full">
          <LoginCard />
        </div>
      </div>
    </div>
  );
};
