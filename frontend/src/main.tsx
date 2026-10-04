import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { ThemeProvider } from './context/ThemeContext'

const RootComponent = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage onLaunch={() => navigate('/terminal')} />} />
        <Route path="/terminal" element={<App />} />
      </Routes>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <RootComponent />
    </Router>
  </StrictMode>,
)

