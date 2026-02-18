import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReactNode } from "react";

type ServiceLayoutProps = {
  children: ReactNode;
};

export default function ServiceLayout({ children }: ServiceLayoutProps) {
  return (
    <>
      <Navbar contact />
      <main>{children}</main>
      <Footer />
    </>
  );
}
