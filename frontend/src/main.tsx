import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LandingPage } from './pages/LandingPage.tsx'

const RootComponent = () => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<LandingPage onLaunch={() => navigate('/terminal')} />} />
      <Route path="/terminal" element={<App />} />
    </Routes>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <RootComponent />
    </Router>
  </StrictMode>,
)
