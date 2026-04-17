import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { supabase } from '../lib/supabaseClient'; // Ensure this path is correct

import LandingPage from './screens/LandingPage';
import LoginPage from './screens/LoginPage';
import DashboardHome from './screens/DashboardHome';
import Workspace from './screens/Workspace';

function App() {
  const lenisRef = useRef();

  // 1. GSAP & Lenis Scroll Logic
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  // 2. Auth State Logic
  // We keep this simple here. Don't force redirects in App.jsx 
  // so the Landing Page can load freely.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        console.log("User signed in:", session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false}>
      <Router>
        <div className="App">
          <Routes>
            {/* The "/" path MUST point to LandingPage */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/workspace" element={<Workspace />} />
          </Routes>
        </div>
      </Router>
    </ReactLenis>
  );
}

export default App;