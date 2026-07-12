import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const ForgotSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#d1d5db] flex items-center justify-center p-4 md:p-10 font-['Cairo']">
      <div className="bg-white w-full max-w-[550px] rounded-[2.5rem] shadow-2xl p-8 md:p-14 animate-fade-in relative text-center flex flex-col items-center">
        
        {/* اللوجو */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#0a2342] flex items-center justify-center p-4 shadow-lg">
            <img src="/logo.png" alt="Rased" className="w-full object-contain" />
          </div>
        </div>

        {/* العناوين */}
        <div className="mb-10" dir="rtl">
          <h2 className="text-3xl font-black text-gray-900 mb-2">استعادة كلمة السر</h2>
          <p className="text-gray-400 font-medium text-lg">كلمة السر اتغيرت بنجاح</p>
        </div>

        {/* أيقونة النجاح */}
        <div className="flex justify-center items-center w-24 h-24 rounded-full mb-12">
          <CheckCircle2 size={100} className="text-[#64ff33] stroke-[1.5]" />
        </div>

        {/* زر العودة */}
        <button 
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] text-xl mb-8"
          onClick={() => navigate("/login")}
        >
          ارجع لتسجيل الدخول
        </button>

        {/* خط ديكور سفلي كما في الصورة */}
        <div className="w-full border-t border-gray-100 pt-4"></div>
      </div>
    </div>
  );
};

export default ForgotSuccess;