import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Sidebar,
  type SidebarGroupProps,
  SidebarProvider,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "./sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdownMenu/dropdownMenu";
import { Icon } from "../icon/icon";
import { Input } from "../input/input";

const meta: Meta<typeof Sidebar> = {
  title: "Design System/Sidebar",
  component: Sidebar,
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          height: "90vh",
          width: "100%",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

// --- Types ---

type Company = {
  id: string;
  name: string;
  logo: string;
  logoColor: string;
};

type Branch = {
  id: string;
  name: string;
  logo: string;
  logoColor: string;
};

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

// --- Helper Components ---

const LogoImage = ({ src, alt }: { src: string; alt: string }) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="size-full object-cover"
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
};

function CompanyAndBranch({
  companies,
  branches,
}: {
  companies: Company[];
  branches: Branch[];
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0].id);
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0].id);

  const activeCompany =
    companies.find((c) => c.id === selectedCompanyId) || companies[0];
  const activeBranch =
    branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleCompanyClick = (id: string) => {
    setSelectedCompanyId(id);
  };

  const handleBranchClick = (id: string) => {
    setSelectedBranchId(id);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-sidebar-border"
            >
              <div
                className={`flex aspect-square size-8 items-center justify-center rounded-lg ${activeCompany.logoColor} overflow-hidden shrink-0`}
              >
                <LogoImage src={activeCompany.logo} alt={activeCompany.name} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  {activeCompany.name}
                </span>
                <span className="truncate text-xs">{activeBranch.name}</span>
              </div>
              <Icon
                type="unfold_more"
                className="ml-auto group-data-[collapsible=icon]:hidden"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[500px] rounded-lg p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <div className="p-2">
              <Input
                id="search"
                label="Search"
                hideLabel
                icon={{ left: "search" }}
                placeholder="Search..."
                className="w-full"
              />
            </div>
            <div className="h-px bg-neutral-light-gray mx-1" />

            <div className="flex">
              <div className="flex-1 p-2">
                <div className="px-2 mb-2 text-xs font-medium text-neutral-gray text-left">
                  Company
                </div>
                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    onClick={() => handleCompanyClick(company.id)}
                    className={`gap-2 p-2 cursor-pointer ${
                      activeCompany.id === company.id
                        ? "bg-brand-light-green"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex size-6 items-center justify-center rounded-sm ${company.logoColor} overflow-hidden`}
                    >
                      <LogoImage src={company.logo} alt={company.name} />
                    </div>
                    {company.name}
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="w-px bg-neutral-light-gray" />
              <div className="flex-1 p-2">
                <div className="px-2 mb-2 text-xs font-medium text-neutral-gray text-left">
                  Branch
                </div>
                {branches.map((branch) => (
                  <DropdownMenuItem
                    key={branch.id}
                    onClick={() => handleBranchClick(branch.id)}
                    className={`gap-2 p-2 cursor-pointer ${
                      activeBranch.id === branch.id
                        ? "bg-brand-light-green"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex size-6 items-center justify-center rounded-sm ${branch.logoColor} overflow-hidden`}
                    >
                      <LogoImage src={branch.logo} alt={branch.name} />
                    </div>
                    {branch.name}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
            <div className="h-px bg-neutral-light-gray mx-1" />
            <div className="p-2">
              <DropdownMenuItem className="gap-2 p-2 text-brand-green cursor-pointer">
                <div className="flex size-6 items-center justify-center rounded-sm">
                  <Icon type="swap_horiz" className="size-5 shrink-0" />
                </div>
                <span className="underline decoration-dotted underline-offset-4">
                  Switch to Agency Portal
                </span>
                <Icon type="arrow_outward" className="size-3 opacity-50" />
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const AVATAR_URL = "https://api.dicebear.com/9.x/identicon/svg?seed=Easton";

function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user?.firstName} ${user?.lastName}`
      : user?.email;

  const hasDisplayName = displayName !== user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarImage src={user.avatar || AVATAR_URL} alt={displayName} />
            <AvatarFallback className="rounded-sm">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            {hasDisplayName && (
              <span className="truncate text-xs">{user?.email}</span>
            )}
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-sidebar-border"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar || AVATAR_URL} alt={displayName} />
              <AvatarFallback className="rounded-lg">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              {hasDisplayName && (
                <span className="truncate text-xs">{user?.email}</span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <Icon type="logout" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const FavouriteStar = ({ filled }: { filled: boolean }) => {
  const [filledState, setFilledState] = useState(filled);

  return (
    <SidebarMenuAction>
      <Icon
        type="star"
        className={`ml-auto h-5 w-5 shrink-0 ${
          filledState ? "text-yellow-400" : "text-neutral-gray"
        }`}
        onClick={() => {
          setFilledState(!filledState);
        }}
      />
    </SidebarMenuAction>
  );
};

// --- Mock Data ---

const companies: Company[] = [
  {
    id: "1",
    name: "SPACING Ventures",
    logo: "https://picsum.photos/200",
    logoColor: "bg-neutral-black",
  },
  {
    id: "2",
    name: "Acme Corp",
    logo: "https://picsum.photos/201",
    logoColor: "bg-blue-500",
  },
  {
    id: "3",
    name: "Example Inc",
    logo: "https://picsum.photos/202",
    logoColor: "bg-green-500",
  },
];

const branches: Branch[] = [
  {
    id: "1",
    name: "Heidelberg",
    logo: "https://picsum.photos/203",
    logoColor: "bg-neutral-black",
  },
  {
    id: "2",
    name: "Munich",
    logo: "https://picsum.photos/204",
    logoColor: "bg-purple-500",
  },
  {
    id: "3",
    name: "Berlin",
    logo: "https://picsum.photos/205",
    logoColor: "bg-orange-500",
  },
];

const links: SidebarGroupProps[] = [
  {
    title: "Navigation",
    collapsible: true,
    links: [
      { name: "Dashboard", url: "/", icon: "dashboard" },
      { name: "Projects", icon: "folder" },
      { name: "Reports", url: "/reports", icon: "bar_chart" },
    ],
  },
  {
    title: "Companies",
    collapsible: true,
    links: [
      {
        name: "ABC",
        url: "/companies/ABC",
        img: "https://picsum.photos/200",
        action: () => <FavouriteStar filled={true} />,
      },
      {
        name: "DEF",
        url: "/companies/DEF",
        img: "https://picsum.photos/201",
        action: () => <FavouriteStar filled={false} />,
      },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help & Support", url: "/help", icon: "help" },
      { name: "Documentation", url: "/docs", icon: "menu_book" },
    ],
  },
  {
    hasSpaceOnTop: true,
    links: [{ name: "Settings", url: "/settings", icon: "settings" }],
  },
];

// --- Stories ---

const DefaultExample = () => {
  const user: User = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    avatar: AVATAR_URL,
  };

  const [activeUrl, setActiveUrl] = useState("/");

  const isActive = (url: string) => url === activeUrl;

  return (
    <>
      <SidebarProvider>
        <Sidebar
          header={() => (
            <CompanyAndBranch companies={companies} branches={branches} />
          )}
          linkGroups={links}
          footer={() => <NavUser user={user} />}
          isActive={isActive}
        />
        <main className="flex-1 p-4">
          <div className="text-lg font-medium mb-4">Main Content Area</div>
          <div className="space-y-2">
            <p className="text-sm text-neutral-gray">
              Click on sidebar links to see the active state change.
            </p>
            <div className="flex flex-wrap gap-2">
              {["/", "/reports", "/help", "/docs", "/settings"].map((url) => (
                <button
                  key={url}
                  onClick={() => setActiveUrl(url)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    activeUrl === url
                      ? "bg-brand-green text-white border-brand-green"
                      : "border-neutral-light-gray hover:bg-neutral-nearly-white"
                  }`}
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export const Default: Story = {
  render: () => <DefaultExample />,
};

const MinimalExample = () => {
  const minimalLinks: SidebarGroupProps[] = [
    {
      links: [
        { name: "Dashboard", url: "/", icon: "dashboard" },
        { name: "Settings", url: "/settings", icon: "settings" },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar linkGroups={minimalLinks} />
      <main className="flex-1 p-4">
        <div>Minimal sidebar without header or footer</div>
      </main>
    </SidebarProvider>
  );
};

export const Minimal: Story = {
  render: () => <MinimalExample />,
};
