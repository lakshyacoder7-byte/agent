import { AuthProvider } from "../context/AuthContext.jsx";
import { ThemeProvider } from "../components/common/ThemeProvider.jsx";
import "../styles/global.css";
import "../styles/pages/auth.css";
import "../styles/pages/home.css";
import "../styles/pages/search.css";
import "../styles/pages/welcome.css";
import "../styles/aven-master.css";

export const metadata = {
  title: "AVEN",
  description: "Intelligence, reimagined.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
