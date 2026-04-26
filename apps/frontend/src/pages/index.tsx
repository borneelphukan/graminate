import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      if (token && userId) {
        // Basic JWT expiration check
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(window.atob(base64));
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp > currentTime) {
            router.replace(`/${userId}`);
            return;
          }
        } catch (error) {
          console.error("Token validation failed", error);
        }
      }
      
      // If no valid session, go to login
      router.replace("/login");
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <Head>
        <title>Graminate | Loading...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    </>
  );
};

export default Index;
