import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ClubPage } from "./pages/ClubPage";
import { ClubsPage } from "./pages/ClubsPage";
import { EntryPage } from "./pages/EntryPage";
import { HomePage } from "./pages/HomePage";
import { MemberPage } from "./pages/MemberPage";
import { MembersPage } from "./pages/MembersPage";
import { SettingsPage } from "./pages/SettingsPage";

/**
 * App-level MUI theme. Defaults to the system colour scheme preference.
 * Customise palette, typography, etc. here as the design evolves.
 *
 * HashRouter is used instead of BrowserRouter because Tauri serves the app
 * from a custom protocol — there is no server to handle path-based routes.
 */
const theme = createTheme({
  colorSchemes: { dark: true },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entry/:id" element={<EntryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:id" element={<ClubPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
