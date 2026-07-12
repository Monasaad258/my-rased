import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // الفحص بيتم مرة واحدة أول ما الأبلكيشن يفتح خالص
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        // لو مسجل دخول قبل كده، ادخل علطول على الرئيسية جوه الداشبورد
        navigate('/dashboard', { replace: true });
      } else {
        // لو مش مسجل، روح لصفحة تسجيل الدخول
        navigate('/login', { replace: true });
      }
    };

    // وقت عرض شاشة الـ Splash (مثلاً ثانيتين) قبل التوجيه
    const timer = setTimeout(() => {
      checkAuth();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0e2a5e] flex flex-col items-center justify-center font-['Cairo'] text-white">
      <div className="w-32 h-32 bg-[#1e60d2] rounded-full flex items-center justify-center p-6 shadow-2xl animate-pulse mb-4">
        <img src="/logo.png" alt="Rased Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-3xl font-black text-[#ffda79] tracking-wide animate-bounce">منظومة راصد</h1>
      <p className="text-sm opacity-60 mt-2 font-bold">جاري تحميل المنظومة الذكية...</p>
    </div>
  );
};

export default SplashScreen;