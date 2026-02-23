import { UserPreferencesProvider } from "@/contexts/userPreferencesContext";
import "@/styles/globals.css";
import "material-symbols/outlined.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserPreferencesProvider>
      <Component {...pageProps} />
    </UserPreferencesProvider>
  );
}
