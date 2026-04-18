import React from "react";
import Image from "next/image";
import { Icon } from "@graminate/ui";

interface NavbarProps {
  imageSrc?: string;
  userId: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar = ({
  imageSrc = "/images/logo.png",
  userId,
  isSidebarOpen,
  toggleSidebar,
}: NavbarProps) => {
  return (
    <header className="px-6 lg:px-12 bg-gray-800 py-2 w-full top-0 z-50">
      <div className="relative flex h-12 py-1 justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-gray-400 hover:text-white focus:outline-none mr-2"
            onClick={toggleSidebar}
            aria-expanded={isSidebarOpen}
          >
            <Icon type={"menu"} className="size-6" />
          </button>
          <Image
            src={imageSrc}
            alt="Graminate Logo"
            className="h-10 w-auto"
            width={100}
            height={40}
            priority
          />
          <span className="hidden sm:inline font-bold text-3xl text-light">
            Graminate
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
