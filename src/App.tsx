import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { HashRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
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
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
