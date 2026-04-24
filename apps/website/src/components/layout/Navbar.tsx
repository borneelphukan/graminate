import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Icon } from "@graminate/ui";
import { useTranslation } from "@/contexts/I18nContext";

type NavLink = {
  label: string;
  href: string;
};

type NavSection = {
  title: string;
  path: string;
  links: NavLink[];
};

const SOLUTIONS_NAV_DATA: NavSection[] = [
  {
    title: "Platform Solutions",
    path: "/industries",
    links: [
      {
        label: "For Producers",
        href: "/industries#producers",
      },
      {
        label: "For Sellers",
        href: "/industries#sellers",
      },
    ],
  },
];

const COMPANY_NAV_DATA: NavSection[] = [
  {
    title: "About Graminate",
    path: "/company/about_us",
    links: [
      { label: "About Us", href: "/company/about_us" },
      { label: "Careers", href: "/company/career" },
    ],
  },
];

const MAIN_NAV_ITEMS: {
  label: string;
  path: string;
  bannerKey?: string;
  data?: NavSection[];
}[] = [
  { label: "Home", path: "/" },
  {
    label: "Solutions",
    path: "/industries",
    bannerKey: "solutions",
    data: SOLUTIONS_NAV_DATA,
  },
  { label: "Docs", path: "/docs" },
  {
    label: "Company",
    path: "/company/about_us",
    bannerKey: "company",
    data: COMPANY_NAV_DATA,
  },
];

type BannerKey = (typeof MAIN_NAV_ITEMS)[number]["bannerKey"] | null;

type Props = {
  imageSrc?: string;
  signIn?: boolean;
  contact?: boolean;
};

const Navbar = ({
  imageSrc = "/images/logo.png",
  signIn = false,
  contact = false,
}: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const navbarRef = useRef<HTMLElement>(null);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  type MobileDropdownKey = NonNullable<BannerKey>;
  const [openMobileDropdown, setOpenMobileDropdown] = useState<MobileDropdownKey | null>(null);

  const closeBannersAndMenu = () => {
    setMobileMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setOpenMobileDropdown(null);
    }
  }, [isMobileMenuOpen]);

  const navigateTo = (route: string) => {
    closeBannersAndMenu();
    router.push(route);
  };

  const handleMobileDropdownToggle = (key: MobileDropdownKey) => {
    setOpenMobileDropdown((prev) => (prev === key ? null : key));
  };

  const renderNavContent = (
    sections: NavSection[],
    isMobile: boolean = false
  ) =>
    sections.map((section) => (
      <div key={section.title}>
        <h3
          className={`font-semibold uppercase ${
            isMobile ? "text-green-200 text-left mt-4" : "text-green-200"
          }`}
        >
          <Link href={section.path} onClick={closeBannersAndMenu}>
            {section.title}
          </Link>
        </h3>
        <ul
          className={`mt-2 space-y-${isMobile ? "1" : "2"} text-sm ${
            isMobile ? "text-left" : ""
          }`}
        >
          {section.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={closeBannersAndMenu}
                className="hover:text-gray-300"
              >
                {t(`nav.${link.label.toLowerCase().replace(/ /g, "")}`)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ));

  return (
    <>
      <header
        ref={navbarRef}
        id="main-navbar"
        className="bg-gray-800 py-2 z-50 relative"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative flex h-12 items-center justify-between py-1">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex flex-row items-center gap-4 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/");
                }}
              >
                <Image
                  src={imageSrc}
                  alt="Graminate Logo"
                  width={40}
                  height={40}
                />
                <span className="hidden text-3xl text-white sm:inline font-bold">
                  {t("nav.brand")}
                </span>
              </Link>
            </div>

            <nav className="hidden space-x-6 md:flex">
              {MAIN_NAV_ITEMS.map((item) => (
                <div key={item.label} className="relative flex items-center">
                  {item.data ? (
                    <Menu as="div" className="relative">
                      {({ open }) => (
                        <>
                          <MenuButton className="flex items-center gap-2 text-sm text-white hover:text-gray-300 focus:outline-none capitalize transition-colors">
                            {t(`nav.${item.label.toLowerCase()}`)}
                            <Icon 
                              type={open ? "expand_less" : "expand_more"} 
                              className="size-4 opacity-70"
                            />
                          </MenuButton>

                          <Transition
                            as={React.Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95 translate-y-[-10px]"
                            enterTo="transform opacity-100 scale-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100 translate-y-0"
                            leaveTo="transform opacity-0 scale-95 translate-y-[-10px]"
                          >
                            <MenuItems className="absolute left-0 mt-4 w-48 origin-top-left rounded-2xl bg-white/90 backdrop-blur-md p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 focus:outline-none border border-white/20">
                              <div className="flex flex-col gap-1">
                                {item.data?.[0]?.links.map((link) => (
                                  <MenuItem key={link.href}>
                                    {({ active }) => (
                                      <Link
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                          active 
                                            ? "bg-emerald-50 text-emerald-700 translate-x-1" 
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        <div className={`size-1.5 rounded-full transition-all duration-300 ${active ? "bg-emerald-500 scale-100" : "bg-gray-300 scale-50"}`} />
                                        {t(`nav.${link.label.toLowerCase().replace(/ /g, "")}`)}
                                      </Link>
                                    )}
                                  </MenuItem>
                                ))}
                              </div>
                            </MenuItems>
                          </Transition>
                        </>
                      )}
                    </Menu>
                  ) : (
                    <Link
                      href={item.path}
                      className="text-sm text-white hover:text-gray-300 focus:outline-none capitalize transition-colors"
                      onClick={closeBannersAndMenu}
                    >
                      {t(`nav.${item.label.toLowerCase()}`)}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                className="text-white focus:outline-none"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              {/* Language Dropdown */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors focus:outline-none bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-200">
                    <Icon type="public" className="size-4" />
                    <span className="uppercase font-bold tracking-wider text-[10px]">
                      {router.locale}
                    </span>
                  </MenuButton>
                </div>

                <Transition
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-[-10px]"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-[-10px]"
                >
                  <MenuItems className="absolute right-0 z-10 mt-4 w-44 origin-top-right rounded-2xl bg-gray-900/90 backdrop-blur-md border border-gray-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus:outline-none overflow-hidden p-1.5">
                    <div className="flex flex-col gap-1">
                      {[
                        { code: "en", label: "English", flag: "🇺🇸" },
                        { code: "de", label: "Deutsch", flag: "🇩🇪" },
                        { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
                        { code: "as", label: "অসমীয়া", flag: "🇮🇳" },
                      ].map((lang) => (
                        <MenuItem key={lang.code}>
                          {({ active }) => (
                            <button
                              onClick={() => router.push(router.pathname, router.asPath, { locale: lang.code })}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                active || router.locale === lang.code
                                  ? "bg-gray-800 text-emerald-400 translate-x-1" 
                                  : "text-gray-300 hover:bg-gray-800/50"
                              }`}
                            >
                              <span className="text-base">{lang.flag}</span>
                              <span className="flex-grow text-left">{lang.label}</span>
                              {router.locale === lang.code && (
                                <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                              )}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>

              {signIn && (
                <Link
                  href="http://localhost:3000/login"
                  className="text-sm whitespace-nowrap text-white hover:text-gray-300"
                  onClick={closeBannersAndMenu}
                >
                  {t("nav.login")}
                </Link>
              )}
              {!signIn && contact && (
                <button
                  className="bg-emerald-500 text-sm text-white py-1.5 px-6 rounded-full hover:bg-emerald-600 cursor-pointer font-bold shadow-lg transition-all hover:scale-105"
                  onClick={() => window.location.assign("http://localhost:3000/login")}
                >
                  {t("nav.login")}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <Transition
            show={isMobileMenuOpen}
            enter="transition-all duration-300 ease-out"
            enterFrom="opacity-0 transform -translate-y-4"
            enterTo="opacity-100 transform translate-y-0"
            leave="transition-all duration-300 ease-in"
            leaveFrom="opacity-100 transform translate-y-0"
            leaveTo="opacity-0 transform -translate-y-4"
          >
            <div className="mt-2 space-y-2 py-4 text-center text-white md:hidden">
              {signIn && (
                <Link
                  href="http://localhost:3000/login"
                  className="block border-b border-gray-300 p-2 hover:text-gray-300"
                  onClick={closeBannersAndMenu}
                >
                  {t("nav.login")}
                </Link>
              )}

              {MAIN_NAV_ITEMS.map((item) => {
                if (item.bannerKey && item.data) {
                  const key = item.bannerKey as MobileDropdownKey;
                  const isOpen = openMobileDropdown === key;
                  return (
                    <div key={item.label}>
                      <button
                        className="block w-full border-b border-gray-300 p-2 text-center hover:text-gray-300"
                        onClick={() => handleMobileDropdownToggle(key)}
                      >
                        {item.label}
                      </button>
                      {isOpen && (
                        <div className="mt-2 bg-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                          {renderNavContent(item.data, true)}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <Link
                      key={item.label}
                      href={item.path}
                      className="block border-b border-gray-300 p-2 hover:text-gray-300"
                      onClick={closeBannersAndMenu}
                    >
                      {item.label}
                    </Link>
                  );
                }
              })}

              {!signIn && contact && (
                <button
                  className="mt-4 bg-emerald-500 font-bold text-sm text-white py-2 px-6 rounded-full hover:bg-emerald-600 cursor-pointer w-auto inline-block shadow-lg"
                  onClick={() => window.location.assign("http://localhost:3000/login")}
                >
                  {t("nav.login")}
                </button>
              )}
            </div>
          </Transition>
        </div>
      </header>
    </>
  );
};

export default Navbar;
