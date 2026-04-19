import "@/styles/globals.css";
import "material-symbols/outlined.css";
import type { AppProps } from "next/app";

import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";

function App({ Component, pageProps }: AppProps) {
  return (
    <UserPreferencesProvider>
      <Component {...pageProps} />
    </UserPreferencesProvider>
  );
}
export default App;
