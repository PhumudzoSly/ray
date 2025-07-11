/* eslint-disable @next/next/no-img-element */
import { appConfig, AUTH_DESCRIPTION, AUTH_TITLE } from "@/utils/config";
import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 w-full bg-primary min-h-screen">
      <div className="lg:col-span-3 mx-auto bg-[#F4F1ED] w-full h-full lg:inline-flex hidden">
        <div className="w-full max-w-2xl mx-auto  hidden lg:flex lg:flex-col h-full items-center justify-center">
          <h1 className="font-bold text-5xl! text-center text-black capitalize">
            {AUTH_TITLE}
          </h1>
          <p className="text-center font-light text-black">
            {AUTH_DESCRIPTION}
          </p>
          <br />
          <img
            src="/auth-bg.png"
            alt="Auth background"
            className="mt-5 max-w-96"
          />
        </div>
      </div>

      <div className="mx-auto w-full lg:col-span-2 py-5 bg-gray-950">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center w-full h-full">
          {children}

          <div className="flex items-center text-white text-xs font-medium mt-10 justify-center gap-5 flex-wrap">
            <a href={`${appConfig.root_domain}/refund`} target="_blank">
              Refund Policy
            </a>
            <a href={`${appConfig.root_domain}/privacy`} target="_blank">
              Privacy Policy
            </a>
            <a href={`${appConfig.root_domain}/terms`} target="_blank">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
