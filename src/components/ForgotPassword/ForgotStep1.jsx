import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react"; 
import Swal from "sweetalert2";
import { authService } from "../../services/api";

const ForgotStep1 = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPasswordSendOtp(email);

      Swal.fire({
        title: 'تم إرسال الكود!',
        text: 'راجع بريدك الإلكتروني لإتمام العملية...',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/reset-password", { state: { email: email } });
      }, 2500);

    } catch (error) {
       Swal.fire({
        title: 'خطأ',
        text: error.message || "حدث خطأ في الاتصال بالسيرفر",
        icon: 'error',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#d1d5db] flex items-center justify-center p-4 md:p-10 font-['Cairo']">
      <div className="bg-white w-full max-w-[550px] rounded-[2.5rem] shadow-2xl p-8 md:p-14 animate-fade-in relative">
        
        {/* اللوجو */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#0a2342] flex items-center justify-center p-4 shadow-lg">
            <img src="/logo.png" alt="Rased" className="w-full object-contain" />
          </div>
        </div>

        {/* العناوين */}
        <div className="text-center mb-10" dir="rtl">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">استعادة كلمة السر</h2>
          <p className="text-gray-400 font-medium text-lg leading-relaxed">
            اكتب بريدك الإلكتروني المسجل عشان نبعتلك كود التأكيد
          </p>
        </div>

        {/* الفورم */}
        <form className="space-y-6" onSubmit={handleSendOTP} dir="rtl">
          <div className="space-y-2">
            <label className="block text-gray-800 font-bold mr-2 text-lg">البريد الإلكتروني</label>
            <div className="relative group">
              <input 
                type="email" 
                className="w-full bg-[#e5e7eb] border-none rounded-2xl py-5 pr-14 pl-4 text-gray-700 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
                placeholder="example@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={loading}
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={24} />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-4 text-xl flex justify-center items-center gap-3" 
            disabled={loading}
          >
            {loading ? (
               <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "ابعت الكود"}
          </button>

          {/* العودة لتسجيل الدخول */}
          <div className="flex justify-center pt-6 border-t border-gray-100">
            <Link to="/login" className="flex items-center text-gray-500 hover:text-blue-600 font-bold transition-colors text-lg">
               العودة لتسجيل الدخول <ArrowRight size={20} className="mr-2" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotStep1;