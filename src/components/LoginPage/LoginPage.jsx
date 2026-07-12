import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react"; 
import Swal from "sweetalert2";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // الربط المباشر برابط الـ API الخاص بكِ
      const response = await axios.post("https://bmw943wz-7262.euw.devtunnels.ms/api/Account/Login", {
        email: email,
        password: password
      });

      // التحقق من استقبال التوكن وتخزينه باسم 'token' ليتوافق مع شاشة الـ Splash والبروفايل
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", email);

        Swal.fire({
          title: 'أهلاً بكِ مجدداً!',
          text: 'تم تسجيل الدخول بنجاح',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        // التوجيه إلى الصفحة الرئيسية داخل الـ Dashboard الثابتة
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error("لم يتم استقبال رمز الصلاحية من السيرفر");
      }

    } catch (err) {
      console.error("Login Error:", err);
      
      // استخلاص رسالة الخطأ الراجعة من السيرفر إن وجدت
      const errorMessage = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';

      Swal.fire({
        title: 'خطأ!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#d1d5db] flex items-center justify-center p-4 md:p-6 font-['Cairo']">
      {/* الكارت الأبيض الرئيسي - ريسبونسيف ومتناسق */}
      <div className="bg-white w-full max-w-[500px] rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-12 transition-all duration-300">
        
        {/* اللوجو */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0a2342] rounded-full flex items-center justify-center p-4 shadow-lg">
             <img src="/logo.png" alt="Rased" className="w-full h-full object-contain invert" />
          </div>
        </div>

        {/* العناوين */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3">تسجيل الدخول</h2>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base font-medium">أهلاً بك في منصة رصد للشكاوى الذكية</p>
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin} dir="rtl">
          {/* حقل البريد الإلكتروني */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-bold mr-2 text-sm sm:text-base">البريد الإلكتروني</label>
            <div className="relative group">
              <input 
                type="email" 
                className="w-full bg-[#e5e7eb] border-none rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-4 text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm sm:text-base"
                placeholder="example@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-bold mr-2 text-sm sm:text-base">كلمة المرور</label>
            <div className="relative group">
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full bg-[#e5e7eb] border-none rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-11 sm:pl-12 text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-left text-sm sm:text-base"
                placeholder="........" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
              <button 
                type="button" 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* نسيت كلمة السر */}
          <div className="text-center">
            <Link to="/forgot-password" className="text-gray-500 hover:text-blue-600 font-bold text-xs sm:text-sm transition-colors">
              نسيت كلمة المرور ؟
            </Link>
          </div>

          {/* زر تسجيل الدخول */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-3 sm:py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2 text-base sm:text-lg"
          >
            {loading ? (
               <div className="w-5 h-5 sm:w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "دخول"}
          </button>

          {/* إنشاء حساب */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-800 font-bold text-xs sm:text-sm">
              ليس لديك حساب؟ 
              <Link to="/signup" className="text-blue-600 hover:underline mr-2 transition-all">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;