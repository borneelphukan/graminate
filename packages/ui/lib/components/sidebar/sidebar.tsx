import { type ComponentType, type ReactNode } from "react";
import { Icon, type IconType } from "../icon/icon.tsx";
import {
  useSidebar,
  Sidebar as RootSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarTrigger,
} from "./_base.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible/collapsible.tsx";
import { cn } from "../../utils.ts";
import logo from "../../assets/images/pactos_icon.svg";
import { useLinkComponent } from "../linkComponent/linkComponent.tsx";

/**
 * @interface Link
 * @description Represents a link item in the sidebar.
 * @property {string} name - The display name of the link.
 * @property {IconType} [icon] - Optional icon type for the link.
 * @property {string} [img] - Optional image URL for the link. Takes priority over the icon if both are provided.
 * @property {string} [url] - Optional URL to navigate to when the link is clicked. If not provided, the button will not be clickable.
 * @property {ComponentType} [action] - Optional React component to render as an action for the link, should be <SidebarMenuAction>
 */
interface Link {
  name: string;
  description?: string;
  icon?: IconType;
  img?: string;
  url?: string;
  action?: ComponentType;
}

export interface SidebarGroupProps {
  title?: string;
  collapsible?: boolean;
  hasSpaceOnTop?: boolean;
  links: Link[];
}

export interface SidebarProps {
  linkGroups: SidebarGroupProps[];
  header?: ComponentType;
  footer?: ComponentType;
  isActive?: (url: string) => boolean;
}

function ExtendedSidebarGroup({
  title,
  collapsible = false,
  hasSpaceOnTop = false,
  children,
}: SidebarGroupProps & { children: ReactNode }) {
  if (collapsible) {
    return (
      <Collapsible
        defaultOpen
        className={cn("group/collapsible", hasSpaceOnTop && "mt-auto")}
      >
        <SidebarGroup className="transition-[colors,opacity] rounded-2xl has-[.trigger:hover]:bg-neutral-nearly-white bg-clip-content group-data-[state=closed]/collapsible:group-data-[collapsible=icon]:p-0 ">
          {title && (
            <SidebarGroupLabel
              className="group-data-[collapsible=open]:mb-2"
              asChild
            >
              <CollapsibleTrigger className="trigger truncate transition-[opacity,margin] group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-ml-4">
                {title}
                <Icon
                  type="chevron_right"
                  className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
          )}
          <CollapsibleContent>
            <SidebarGroupContent>{children}</SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  } else {
    return (
      <SidebarGroup className={hasSpaceOnTop ? "mt-auto" : ""}>
        {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
        <SidebarGroupContent>{children}</SidebarGroupContent>
      </SidebarGroup>
    );
  }
}

function Sidebar({
  header: Header,
  footer: Footer,
  linkGroups,
  isActive,
}: SidebarProps) {
  const LinkComponent = useLinkComponent();

  return (
    <RootSidebar collapsible="icon">
      <SidebarHeader className="flex flex-row justify-between group-data-[collapsible=icon]:relative group/header">
        <img
          src={logo}
          alt="Menu Icon"
          className="h-8 w-8 group-data-[collapsible=icon]:transition-opacity group-data-[collapsible=icon]:group-hover/header:opacity-0"
        />
        <SidebarTrigger className="text-neutral-black group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:inset-0 group-data-[collapsible=icon]:m-auto group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:transition-opacity group-data-[collapsible=icon]:group-hover/header:visible group-data-[collapsible=icon]:group-hover/header:opacity-100 group-data-[collapsible=icon]:z-2" />
      </SidebarHeader>
      <SidebarContent>
        {Header && <div className="m-2">{Header && <Header />}</div>}
        {linkGroups.map(({ title, collapsible, hasSpaceOnTop, links }, idx) => (
          <ExtendedSidebarGroup
            key={`link-group-${idx}`}
            title={title}
            hasSpaceOnTop={hasSpaceOnTop}
            collapsible={collapsible}
            links={links}
          >
            <SidebarMenu>
              {links.map(
                ({
                  name,
                  icon,
                  img,
                  url,
                  action: Action,
                  description,
                }: Link) => (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        url ? "" : "pointer-events-none",
                        description ? "flex items-start h-full" : ""
                      )}
                      isActive={isActive && url ? isActive(url) : false}
                    >
                      <LinkComponent href={url ?? undefined}>
                        {img ? (
                          <img
                            src={img}
                            alt={`${name} image icon`}
                            height="18"
                            width="18"
                            className="rounded-sm object-cover"
                          />
                        ) : icon ? (
                          <Icon type={icon} />
                        ) : null}
                        <span className="transition-[opacity,margin] group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-mt-4">
                          {name}
                          {description && (
                            <span className="text-xs text-neutral-gray block">
                              {description}
                            </span>
                          )}
                        </span>
                      </LinkComponent>
                    </SidebarMenuButton>
                    {Action && <Action />}
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </ExtendedSidebarGroup>
        ))}
      </SidebarContent>
      {Footer && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Footer />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </RootSidebar>
  );
}

export {
  Sidebar,
  SidebarProvider,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
};
