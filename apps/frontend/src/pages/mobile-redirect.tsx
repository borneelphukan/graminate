import React from "react";
import Head from "next/head";
import { Icon, Button } from "@graminate/ui";

const MobileRedirect = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light dark:bg-dark p-6 text-center overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      <Head>

        <title>Download our Mobile App - Graminate</title>
        <meta name="description" content="Please download our mobile and tablet app for the best experience on your device." />
      </Head>

      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-center">
          <div className="p-6 rounded-3xl bg-primary/10 dark:bg-primary/20 scale-110">
            <Icon type="phonelink" className="text-6xl text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-dark dark:text-light">
            Download our <span className="text-primary">mobile</span> and <span className="text-primary">tablet</span> app
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            For the best experience on mobile and tablet devices, please use our dedicated application.
          </p>
        </div>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            className="w-full h-14 text-lg rounded-2xl flex items-center justify-center gap-3"
            variant="primary"
          >
            <Icon type="phone_iphone" className="text-2xl" />
            App Store
          </Button>
          <Button 
            className="w-full h-14 text-lg rounded-2xl flex items-center justify-center gap-3"
            variant="outline"
          >
            <Icon type="play_arrow" className="text-2xl" />
            Google Play
          </Button>
        </div>


        <div className="pt-12 text-sm text-gray-500 dark:text-gray-500">
          Already using the app? <span className="text-primary font-medium cursor-pointer">Open App</span>
        </div>
      </div>
    </div>
  );
};

export default MobileRedirect;
