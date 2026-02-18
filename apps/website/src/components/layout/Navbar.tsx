import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Banner from "./Banner";
import { Transition } from "@headlessui/react";

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
    title: "Software Development",
    path: "/services/software_development",
    links: [
      {
        label: "Web Applications",
        href: "/services/software_development#web-application",
      },
      {
        label: "Enterprise Softwares",
        href: "/services/software_development#enterprise-application",
      },
      {
        label: "Mobile Applications",
        href: "/services/software_development#mobile-application",
      },
      {
        label: "Cloud Applications",
        href: "/services/software_development#cloud-application",
      },
    ],
  },
  {
    title: "Product Design",
    path: "/services/product_design",
    links: [
      { label: "UI/UX Design", href: "/services/product_design#uiux_design" },
      { label: "Web Design", href: "/services/product_design#web_design" },
      {
        label: "Computer-Aided Design (CAD)",
        href: "/services/product_design#cad",
      },
    ],
  },
  {
    title: "IT Operations",
    path: "/services/it_operations",
    links: [
      {
        label: "Integration & Automations",
        href: "/services/it_operations#integration_automation",
      },
      {
        label: "Monitor & Logging",
        href: "/services/it_operations#monitoring_logging",
      },
      {
        label: "Cloud & Infrastructure Management",
        href: "/services/it_operations#cloud",
      },
    ],
  },
  {
    title: "Technology Enablement",
    path: "/services/tech_consulting",
    links: [
      {
        label: "Project Managmenent",
        href: "/services/tech_consulting#project_management",
      },
      {
        label: "Technical Debt Remediation",
        href: "/services/tech_consulting#technical_debt",
      },
      {
        label: "Software Modernization",
        href: "/services/tech_consulting#application_modernization",
      },
    ],
  },
];

const INDUSTRIES_NAV_DATA: NavSection[] = [
  {
    title: "Enterprise",
    path: "/industries/enterprise",
    links: [
      {
        label: "Enterprise Resource Planning (ERP)",
        href: "/industries/enterprise#erp",
      },
      {
        label: "Customer Relationship Management (CRM)",
        href: "/industries/enterprise#crm",
      },
      {
        label: "E-Commerce Platforms",
        href: "/industries/enterprise#e-commerce",
      },
      { label: "Other SaaS Platforms", href: "/industries/enterprise#saas" },
    ],
  },
  {
    title: "Health Care",
    path: "/industries/healthcare",
    links: [
      {
        label: "Fitness & Nutrition",
        href: "/industries/healthcare#fitness_nutrition",
      },
      {
        label: "Clinical, e-Pharma & Hospital IT Systems",
        href: "/industries/healthcare#clinical-systems",
      },
      {
        label: "Softwares for Doctors",
        href: "/industries/healthcare#doctor_softwares",
      },
    ],
  },
  {
    title: "Finance",
    path: "/industries/finance",
    links: [
      {
        label: "Investment & Trading Platforms",
        href: "/industries/finance#investment_trading",
      },
      { label: "Insurance Platforms", href: "/industries/finance#insurance" },
      {
        label: "Personal Finance & Budgeting",
        href: "/industries/finance#personal_finance",
      },
    ],
  },
  {
    title: "Education",
    path: "/industries/education",
    links: [
      {
        label: "Institutional Management Systems",
        href: "/industries/education#institution-management",
      },
      {
        label: "Learning & Teaching Platforms",
        href: "/industries/education#learning_teaching",
      },
      {
        label: "Exam Preparation Platforms",
        href: "/industries/education#exam-platforms",
      },
    ],
  },
  {
    title: "Public Sector",
    path: "/industries/public_sector",
    links: [
      { label: "e-Governance", href: "/industries/public_sector#e-governance" },
      {
        label: "Mobility Platforms",
        href: "/industries/public_sector#mobility",
      },
      {
        label: "Infrastructure & Urban Development",
        href: "/industries/public_sector#urban",
      },
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
    label: "Services",
    path: "/services",
    bannerKey: "services",
    data: SERVICES_NAV_DATA,
  },
  {
    label: "Industries",
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
                className="flex flex-row items-center gap-4"
                onClick={closeBannersAndMenu}
              >
                <Image
                  src={imageSrc}
                  alt="Graminate Logo"
                  width={40}
                  height={40}
                />
                <span className="hidden text-3xl text-white sm:inline font-bold">
                  Graminate
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
                    <button className="text-sm text-white my-auto hover:text-gray-300 focus:outline-none">
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className="text-sm text-white my-auto hover:text-gray-300 focus:outline-none"
                      onClick={closeBannersAndMenu}
                    >
                      {item.label}
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

            <div className="hidden items-center gap-4 md:flex">
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
                  className="bg-green-200 text-sm text-white my-10 py-1.5 px-6 rounded-md hover:bg-green-100 cursor-pointer" // Added button tag for semantics
                  onClick={() => navigateTo("/company/contact_us")}
                >
                  Request Service
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
                  className="mt-4 bg-green-200 font-semibold text-sm text-white py-2 px-6 rounded-md hover:bg-green-100 cursor-pointer w-auto inline-block" // Use w-auto inline-block for centering
                  onClick={() => navigateTo("/company/contact_us")}
                >
                  Request Service
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
