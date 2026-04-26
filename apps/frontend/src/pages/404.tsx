import React from "react";
import Link from "next/link";
import Head from "next/head";
import LoginLayout from "@/layout/LoginLayout";
import { Button, Icon } from "@graminate/ui";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Graminate</title>
      </Head>
      <LoginLayout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-dark relative overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute top-[-10%] right-[-5%] size-[400px] bg-brand-mute-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] size-[300px] bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-md w-full px-6 text-center">
            <div className="mb-8 relative inline-block">
              <div className="size-32 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <span className="text-6xl font-black text-brand-mute-green">404</span>
              </div>
              <div className="absolute -bottom-2 -right-2 size-12 bg-blue-500 rounded-2xl shadow-lg flex items-center justify-center transform rotate-12">
                <Icon type="error" className="text-white size-6" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-dark dark:text-light mb-4 tracking-tight">
              Lost in the field?
            </h1>
            <p className="text-dark dark:text-light mb-10 leading-relaxed">
              We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist anymore.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" passHref>
                <Button 
                  label="Go Back Home" 
                  variant="primary" 
                  icon={{ left: "home" }}
                  shape="circle"
                  className="px-8"
                />
              </Link>
              <Button 
                label="Reload" 
                variant="outline" 
                icon={{ left: "refresh" }}
                onClick={() => window.location.reload()}
                shape="circle"
                className="px-8"
              />
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-dark dark:text-light uppercase tracking-widest">
                Need help? <a href="mailto:support@graminate.com" className="text-brand-mute-green hover:underline">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </LoginLayout>
    </>
  );
};

export default Custom404;
