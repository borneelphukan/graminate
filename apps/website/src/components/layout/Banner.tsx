import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import router from "next/router";

const navigateTo = (route: string) => {
  router.push(route);
};

type BannerProps = {
  isVisible: boolean;
  borderColorClass?: string;
  children: React.ReactNode;
  hideContact?: boolean;
};

const Banner = ({
  isVisible,
  borderColorClass = "border-t border-white",
  children,
  hideContact = false,
}: BannerProps) => {
  return (
    <div
      className={`fixed left-0 w-full bg-light pt-6 pb-3 ${borderColorClass} z-50 shadow-lg overflow-hidden max-h-[calc(100vh-56px)]
      transition-all duration-400 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0 max-h-[400px]"
          : "opacity-0 -translate-y-full max-h-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>

      {!hideContact && (
        <div className="text-center text-sm text-gray-100 mt-4">
          <hr className="mx-5 mb-2 text-gray-400" />
          <div className="flex justify-center items-center gap-8">
            <div className="flex flex-row items-center gap-2">
              <FontAwesomeIcon
                icon={faPhone}
                className="w-4 h-4 text-green-100"
              />
              <a
                href="tel:+4917671259396"
                className="flex items-center hover:text-green-100"
              >
                +49 176 7125 9396
              </a>
            </div>

            <button
              className="bg-green-200 hover:bg-green-100 text-white py-1 px-4 rounded-md shadow cursor-pointer"
              onClick={() => navigateTo("/company/contact_us")}
            >
              Request Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;
