import "@/styles/globals.css";
import "material-symbols/outlined.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";

import Toast from "@/components/ui/Toast";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Basic mobile/tablet detection
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // Check for tablets specifically if needed, or if isMobile covers it
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent.toLowerCase());

    if ((isMobile || isTablet) && router.pathname !== "/mobile-redirect") {
      router.replace("/mobile-redirect");
    }
  }, [router.pathname]);

  return (
    <UserPreferencesProvider>
      <Component {...pageProps} />
      <Toast />
    </UserPreferencesProvider>
  );
}
export default App;

