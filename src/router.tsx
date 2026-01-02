import { Routes, Route, Outlet } from 'react-router-dom';
import App from './App';
import { TypingSpeedTestPage } from './pages/TypingSpeedTestPage';
import { TenFingerCoursePage } from './pages/TenFingerCoursePage';
import { TypingForProgrammersPage } from './pages/TypingForProgrammersPage';
import { TypingGamesForKidsPage } from './pages/TypingGamesForKidsPage';
import { WpmCalculatorPage } from './pages/WpmCalculatorPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LinkClaudePage } from './pages/LinkClaudePage';
import { Footer } from './components/Footer';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Main App */}
        <Route path="/" element={<App />} />

        {/* SEO Landing Pages */}
        <Route path="/typing-speed-test" element={<TypingSpeedTestPage />} />
        <Route path="/10-finger-typing-course" element={<TenFingerCoursePage />} />
        <Route path="/learn-typing-for-programmers" element={<TypingForProgrammersPage />} />
        <Route path="/typing-games-for-kids" element={<TypingGamesForKidsPage />} />
        <Route path="/wpm-calculator" element={<WpmCalculatorPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/link-claude" element={<LinkClaudePage />} />

        {/* Fallback to main app for unmatched routes */}
        <Route path="*" element={<App />} />
      </Route>
    </Routes>
  );
}
