import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. التصميم الرئيسي والصفحات الداخلية
import MainLayout from './components/MainLayout.jsx';
import Home from './components/Home.jsx';
import Reports from './components/Reports.jsx';
import NewReport from './components/NewReport.jsx';
import LiveMap from './components/LiveMap.jsx';
import Profile from './components/Profile.jsx';

// 2. شاشة البداية وصفحات الحسابات
import SplashScreen from "./components/Splash/SplashScreen"; 
import LoginPage from "./components/LoginPage/LoginPage.jsx";
import SignupPage from "./components/SignupPage/SignupPage.jsx";

// 3. فلو استعادة كلمة المرور
import ForgotStep1 from "./components/ForgotPassword/ForgotStep1.jsx";
import ForgotStep2 from "./components/ForgotPassword/ForgotStep2.jsx";
import ForgotSuccess from "./components/ForgotPassword/ForgotSuccess.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* شاشة البداية */}
        <Route path="/" element={<SplashScreen />} />

        {/* مسارات الحسابات */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* استعادة كلمة المرور */}
        <Route path="/forgot-password" element={<ForgotStep1 />} />
        <Route path="/reset-password" element={<ForgotStep2 />} />
        <Route path="/reset-success" element={<ForgotSuccess />} />

        {/* الداشبورد الرئيسي */}
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Home />} /> 
          <Route path="new-report" element={<NewReport />} />
          <Route path="live-map" element={<LiveMap />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* أي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;