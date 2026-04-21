import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Banner from "./Banner";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
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

const SERVICES_NAV_DATA: NavSection[] = [
  {
    title: "Farm Modules",
    path: "/services#modules",
    links: [
      {
        label: "Cattle & Dairy",
        href: "/services#cattle",
      },
      {
        label: "Poultry Management",
        href: "/services#poultry",
      },
      {
        label: "Apiculture (Beekeeping)",
        href: "/services#apiculture",
      },
      {
        label: "Crop Tracking",
        href: "/services#crops",
      },
    ],
  },
  {
    title: "Management Tools",
    path: "/services#tools",
    links: [
      { label: "Integrated Farm CRM", href: "/services#crm" },
      { label: "Smart Warehouse", href: "/services#warehouse" },
      {
        label: "Task & Labor Tracking",
        href: "/services#tasks",
      },
    ],
  },
  {
    title: "Intelligence",
    path: "/services#intelligence",
    links: [
      {
        label: "Graminate AI Assistant",
        href: "/services#ai_assistant",
      },
      {
        label: "Market Insights",
        href: "/services#market",
      },
      {
        label: "Weather Forecasting",
        href: "/services#weather",
      },
    ],
  },
  {
    title: "Pricing & Plans",
    path: "/industries",
    links: [
      {
        label: "Free Plan",
        href: "/industries#free",
      },
      {
        label: "Pro Plan",
        href: "/industries#pro",
      },
      {
        label: "Enterprise Solutions",
        href: "/industries#enterprise",
      },
    ],
  },
];

const INDUSTRIES_NAV_DATA: NavSection[] = [
  {
    title: "Scale Solutions",
    path: "/industries#scale",
    links: [
      {
        label: "Independent Farmers",
        href: "/industries#independent",
      },
      {
        label: "Agricultural Cooperatives",
        href: "/industries#cooperatives",
      },
      {
        label: "National Distributors",
        href: "/industries#distributors",
      },
      { label: "Government Agencies", href: "/industries#government" },
    ],
  },
];

const MAIN_NAV_ITEMS: {
  label: string;
  path: string;
  bannerKey?: string;
  data?: NavSection[];
}[] = [
  {
    label: "Features",
    path: "/services",
    bannerKey: "services",
    data: SERVICES_NAV_DATA,
  },
  {
    label: "Solutions",
    path: "/industries",
    bannerKey: "industries",
    data: INDUSTRIES_NAV_DATA,
  },
  { label: "About Us", path: "/company/about_us" },
  { label: "Careers", path: "/company/career" },
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
  const [activeBanner, setActiveBanner] = useState<BannerKey>(null);
  type MobileDropdownKey = NonNullable<BannerKey>;

  const [openMobileDropdown, setOpenMobileDropdown] =
    useState<MobileDropdownKey | null>(null);

  const handleBannerToggle = (bannerKey: BannerKey) => {
    setActiveBanner(bannerKey);
  };

  const closeBannersAndMenu = () => {
    setActiveBanner(null);
    setOpenMobileDropdown(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (activeBanner) {
        setActiveBanner(null);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeBanner]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setActiveBanner(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setOpenMobileDropdown(null);
      setActiveBanner(null);
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
                {link.label}
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
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    item.bannerKey
                      ? handleBannerToggle(item.bannerKey)
                      : setActiveBanner(null)
                  }
                  onClick={
                    item.bannerKey ? () => navigateTo(item.path) : undefined
                  }
                >
                  {item.bannerKey ? (
                    <button className="text-sm text-white my-auto hover:text-gray-300 focus:outline-none capitalize">
                      {t(`nav.${item.bannerKey === "services" ? "features" : "solutions"}`)}
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className="text-sm text-white my-auto hover:text-gray-300 focus:outline-none capitalize"
                      onClick={closeBannersAndMenu}
                    >
                      {t(`nav.${item.label.toLowerCase().replace(" ", "")}`)}
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
                  <MenuButton className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors focus:outline-none bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600">
                    <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
                    <span className="uppercase font-bold tracking-wider text-[10px]">
                      {router.locale}
                    </span>
                  </MenuButton>
                </div>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-xl bg-gray-800 border border-gray-700 shadow-2xl focus:outline-none overflow-hidden">
                    <div className="py-1">
                      {[
                        { code: "en", label: "English", flag: "🇺🇸" },
                        { code: "de", label: "Deutsch", flag: "🇩🇪" },
                        { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
                        { code: "as", label: "অসমীয়া", flag: "🇮🇳" },
                      ].map((lang) => (
                        <MenuItem key={lang.code}>
                          {({ focus }) => (
                            <button
                              onClick={() => router.push(router.pathname, router.asPath, { locale: lang.code })}
                              className={`${
                                focus ? "bg-gray-700 text-white" : "text-gray-300"
                              } ${
                                router.locale === lang.code ? "text-emerald-400 font-bold" : ""
                              } group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                            >
                              <span className="mr-3">{lang.flag}</span>
                              {lang.label}
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
                  href="/localhost:3000/"
                  className="text-sm whitespace-nowrap text-white hover:text-gray-300"
                  onClick={closeBannersAndMenu}
                >
                  Sign In
                </Link>
              )}
              {!signIn && contact && (
                <button
                  className="bg-emerald-500 text-sm text-white py-1.5 px-6 rounded-full hover:bg-emerald-600 cursor-pointer font-bold shadow-lg transition-all hover:scale-105"
                  onClick={() => navigateTo("/industries")}
                >
                  {t("nav.getPro")}
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
                  href="/sign_in"
                  className="block border-b border-gray-300 p-2 hover:text-gray-300"
                  onClick={closeBannersAndMenu}
                >
                  Sign In
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
                        <div className="mt-2 bg-gray-700 p-4 rounded">
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
                  onClick={() => navigateTo("/industries")}
                >
                  Get Pro
                </button>
              )}
            </div>
          </Transition>
        </div>
      </header>

      {MAIN_NAV_ITEMS.map(
        (item) =>
          item.bannerKey &&
          item.data && (
            <Banner
              key={`${item.bannerKey}-banner`}
              isVisible={activeBanner === item.bannerKey}
              borderColorClass={
                item.bannerKey === "services"
                  ? "border-t border-red-300"
                  : undefined
              }
            >
              <div
                className={`grid grid-cols-1 ${
                  item.bannerKey === "industries"
                    ? "md:grid-cols-3"
                    : "md:grid-cols-4"
                } gap-8 text-gray-800`}
              >
                {renderNavContent(item.data)}
              </div>
            </Banner>
          )
      )}
    </>
  );
};

export default Navbar;
