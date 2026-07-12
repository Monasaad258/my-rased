import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Lock, FileDigit } from "lucide-react";
import Swal from "sweetalert2";
import { authService } from "../../services/api";

const ForgotStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <Navigate to="/forgot-password" />;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'تنبيه',
        text: 'كلمتا المرور غير متطابقتين!',
        icon: 'warning',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email,
        code: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      };

      await authService.resetPassword(payload);

      Swal.fire({
        title: 'تم بنجاح',
        text: 'تم تغيير كلمة السر بنجاح!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => { 
        navigate("/login"); // أو الصفحة التي تفضلها
      }, 1500);

    } catch (err) {
      Swal.fire({
        title: 'خطأ',
        text: err.message || 'حدث خطأ أثناء تغيير كلمة المرور',
        icon: 'error',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#d1d5db] flex items-center justify-center p-4 md:p-10 font-['Cairo']">
      <div className="bg-white w-full max-w-[550px] rounded-[2.5rem] shadow-2xl p-8 md:p-14 animate-fade-in relative text-center">
        
        {/* اللوجو */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#0a2342] flex items-center justify-center p-4 shadow-lg">
            <img src="/logo.png" alt="Rased" className="w-full object-contain" />
          </div>
        </div>

        {/* العناوين */}
        <div className="mb-8" dir="rtl">
          <h2 className="text-3xl font-black text-gray-900 mb-2">استعادة كلمة السر</h2>
          <p className="text-gray-400 font-medium">بعتنا كود التأكيد للبريد</p>
          <span className="text-gray-400 font-bold block mt-1" dir="ltr">{email}</span>
        </div>

        {/* الفورم */}
        <form onSubmit={handleResetPassword} className="space-y-6" dir="rtl">
          {/* كود التأكيد */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-bold mr-2 text-right">كود التأكيد (6 أرقام)</label>
            <div className="relative group">
              <input
                type="text"
                className="w-full bg-[#e5e7eb] border-none rounded-2xl py-4 text-center text-2xl font-black tracking-[0.3em] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* كلمة السر الجديدة */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-bold mr-2 text-right">كلمة السر الجديدة</label>
            <div className="relative group">
              <input
                type="password"
                className="w-full bg-[#e5e7eb] border-none rounded-2xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>

          {/* تأكيد كلمة السر */}
          <div className="space-y-2">
            <label className="block text-gray-800 font-bold mr-2 text-right">تأكيد كلمة السر</label>
            <div className="relative group">
              <input
                type="password"
                className="w-full bg-[#e5e7eb] border-none rounded-2xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] text-xl flex justify-center items-center gap-3" 
            disabled={loading}
          >
            {loading ? (
               <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "تغيير كلمة السر"}
          </button>
        </form>

        {/* الفوتر */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-sm space-y-3">
          <p className="text-gray-900 font-bold">
            ماوصلكش الكود؟ <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline mr-1">ابعت تاني</button>
          </p>
          <p className="text-gray-400 font-medium">
            لو واجهت مشكلة، كلمنا على الخط الساخن 19XXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotStep2;