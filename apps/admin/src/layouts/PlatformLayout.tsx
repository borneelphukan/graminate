import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar";

type Props = {
  children: React.ReactNode;
};

const PlatformLayout = ({ children }: Props) => {
  const router = useRouter();
  const { admin_id } = router.query;

  if (!admin_id) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
      <Navbar userId={admin_id as string} />
      <div className="flex flex-1">
        <Sidebar adminId={admin_id as string} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default PlatformLayout;
