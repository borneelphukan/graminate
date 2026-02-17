import {
  type ComponentType,
  type ComponentProps,
  type PropsWithChildren,
  createContext,
  useContext,
} from "react";

function DefaultLinkComponent({ children, ...props }: ComponentProps<"a">) {
  return <a {...props}>{children}</a>;
}

const LinkComponentContext =
  createContext<ComponentType<ComponentProps<"a">>>(DefaultLinkComponent);

export function LinkComponentProvider({
  value = DefaultLinkComponent,
  children,
}: PropsWithChildren<{ value?: ComponentType<ComponentProps<"a">> }>) {
  return (
    <LinkComponentContext.Provider value={value}>
      {children}
    </LinkComponentContext.Provider>
  );
}

export function useLinkComponent() {
  const ctx = useContext(LinkComponentContext);
  if (!ctx) {
    throw new Error(
      "useLinkComponent must be used within a LinkComponentProvider"
    );
  }
  return ctx;
}
