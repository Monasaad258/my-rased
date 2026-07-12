import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, CreditCard, Lock, FileDigit, ArrowRight, Car, Phone } from "lucide-react"; 
import Swal from "sweetalert2";

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("driver"); // السائق هو الافتراضي، ويمكن التبديل لـ passenger
  const [formData, setFormData] = useState({
    fullName: "", 
    email: "", 
    ssn: "", 
    password: "", 
    confirmPassword: "", 
    phoneNumber: "", 
    plateNumber: "" 
  });
  const [otpCode, setOtpCode] = useState(""); 
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // تنظيف البيانات وتجهيزها برمجياً لضمان عدم حدوث أخطاء Validation من السيرفر
    const cleanEmail = formData.email.trim().toLowerCase(); // تحويل الإيميل لـ small وحذف المسافات
    const cleanSSN = formData.ssn.trim();
    const cleanPhone = formData.phoneNumber.trim();
    const cleanPlate = formData.plateNumber.trim().toUpperCase(); // تحويل لوحة السيارة لكابيتال لو إنجليزي

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ title: 'خطأ', text: 'كلمات المرور غير متطابقة', icon: 'error', confirmButtonText: 'حسناً' });
      return;
    }

    // فحص بسيط لطول رقم الهاتف وبدايته قبل الإرسال
    if (cleanPhone.length !== 11 || !/^01[0125]\d{8}$/.test(cleanPhone)) {
      Swal.fire({ title: 'رقم هاتف غير صحيح', text: 'يجب أن يتكون رقم الهاتف من 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015 باللغة الإنجليزية', icon: 'warning', confirmButtonText: 'حسناً' });
      return;
    }

    setLoading(true);

    const payload = {
      fullName: formData.fullName.trim(),
      email: cleanEmail,
      phoneNumber: String(cleanPhone),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      ssn: String(cleanSSN), 
      userType: role === "passenger" ? 0 : 1, // 0 راكب، 1 سائق
      plateNumber: role === "driver" ? cleanPlate : "" 
    };

    // طباعة الـ Payload في الكونسول لمراجعته فوراً عند الضغط على الزر
    console.log("البيانات بعد التنظيف والإرسال (Payload):", payload);

    try {
      const response = await fetch("https://bmw943wz-7262.euw.devtunnels.ms/api/Account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // قراءة الاستجابة كنص لمعرفة الـ Response الفعلي
      const textData = await response.text();
      console.log(`حالة استجابة السيرفر (${response.status}):`, textData);

      let resData = {};
      try { 
        resData = JSON.parse(textData); 
      } catch(e) { 
        resData = { message: textData }; 
      }

      // التحقق من فشل الطلب واستخراج الخطأ التفصيلي القادم من السيرفر
      if (!response.ok) {
        let errorMessage = resData.message || "فشل تسجيل البيانات على السيرفر.";
        
        // إذا كان السيرفر يعيد أخطاء Validation على هيئة Object
        if (resData.errors) {
          errorMessage = Object.values(resData.errors).flat().join(" - ");
        } else if (typeof resData === "string") {
          errorMessage = resData;
        }
        
        throw new Error(errorMessage);
      }
      
      Swal.fire({ title: 'تم إرسال الكود!', text: 'الرجاء إدخل رقم التأكيد المرسل لإتمام الإنشاء', icon: 'success', timer: 2000, showConfirmButton: false });
      setStep(2);

    } catch (err) {
      console.error("خطأ تفصيلي أثناء عملية التسجيل:", err);

      Swal.fire({ 
        title: 'خطأ في التسجيل', 
        // عرض الرسالة الحقيقية القادمة من السيرفر مباشرة (مثل: الحساب مسجل بالفعل)
        text: err.message || "حدث خطأ في الشبكة. تأكدي من عمل الـ Bypass للـ Tunnel أو حالة السيرفر.", 
        icon: 'error', 
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      Swal.fire({ title: 'خطأ', text: 'الرجاء إدخال كود التحقق كاملاً (6 أرقام)', icon: 'warning', confirmButtonText: 'حسناً' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://bmw943wz-7262.euw.devtunnels.ms/api/Account/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), code: otpCode })
      });

      const textData = await response.text();
      let resData = {};
      try { resData = JSON.parse(textData); } catch(e) { resData = { message: textData }; }

      if (!response.ok) {
        throw new Error(resData.message || "كود التحقق غير صحيح.");
      }

      await Swal.fire({ title: 'مبروك!', text: 'تم تفعيل حسابك بنجاح في منظومة راصد', icon: 'success', confirmButtonText: 'الانتقال لتسجيل الدخول' });
      navigate("/login"); 

    } catch (err) {
      Swal.fire({ title: 'فشل تفعيل الحساب', text: err.message, icon: 'error', confirmButtonText: 'محاولة أخرى' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#d1d5db] flex items-center justify-center p-4 md:p-10 font-['Cairo']">
      <div className="bg-white w-full max-w-[850px] rounded-[2rem] shadow-2xl p-6 md:p-12 animate-fade-in relative">
        
        <button onClick={() => navigate(-1)} className="absolute left-8 top-10 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowRight size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">إنشاء حساب جديد</h2>
          <p className="text-gray-400 font-medium">املأ البيانات التالية للتسجيل في المنظومة</p>
        </div>

        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleSignupSubmit} dir="rtl">
            
            {/* أزرار اختيار نوع الحساب */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <button 
                type="button"
                className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-4 transition-all border-2 ${role === 'passenger' ? 'bg-[#3b4353] text-white border-slate-700 shadow-inner' : 'bg-[#e5e7eb] border-transparent text-gray-700'}`}
                onClick={() => setRole('passenger')}
              >
                <div className={`p-3 rounded-full ${role === 'passenger' ? 'bg-white/20' : 'bg-white shadow-sm'}`}><User size={24} /></div>
                <span className="text-xl font-bold">راكب</span>
              </button>
              <button 
                type="button"
                className={`flex-1 p-5 rounded-2xl flex items-center justify-center gap-4 transition-all border-2 ${role === 'driver' ? 'bg-[#475166] text-white border-slate-800 shadow-inner' : 'bg-[#e5e7eb] border-transparent text-gray-700'}`}
                onClick={() => setRole('driver')}
              >
                <div className={`p-3 rounded-full ${role === 'driver' ? 'bg-white/20 text-white' : 'bg-white shadow-sm'}`}><Car size={24} /></div>
                <span className="text-xl font-bold">سائق</span>
              </button>
            </div>

            {/* الاسم الرباعي */}
            <div className="space-y-2">
              <label className="block text-gray-800 font-bold mr-2 text-sm text-right">الاسم الرباعي</label>
              <div className="relative">
                <input name="fullName" type="text" className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="محمد احمد علي محمود" value={formData.fullName} onChange={handleChange} required />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              </div>
            </div>

            {/* الرقم القومي والبريد الإلكتروني في صف واحد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* البريد الإلكتروني */}
              <div className="space-y-2">
                <label className="block text-gray-800 font-bold mr-2 text-sm text-right">البريد الالكتروني</label>
                <div className="relative">
                  <input name="email" type="email" className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
                <p className="text-xs text-gray-400 text-right mr-2">* يرجى كتابة البريد بحروف صغيرة (small) وبدون مسافات.</p>
              </div>

              {/* الرقم القومي */}
              <div className="space-y-2">
                <label className="block text-gray-800 font-bold mr-2 text-sm text-right">الرقم القومي</label>
                <div className="relative">
                  <input name="ssn" type="text" className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="29000000000000" maxLength={14} value={formData.ssn} onChange={handleChange} required />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
                <p className="text-xs text-gray-400 text-right mr-2">* يتكون من 14 رقم باللغة الإنجليزية.</p>
              </div>
            </div>

            {/* حقل رقم اللوحة المعدنية ويظهر في السائق */}
            {role === "driver" && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-gray-800 font-bold mr-2 text-sm text-right">رقم لوحة السيارة</label>
                <div className="relative">
                  <input name="plateNumber" type="text" className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="أ ب ج 1 2 3" value={formData.plateNumber} onChange={handleChange} required />
                  <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-gray-800 font-bold mr-2 text-sm text-right">رقم الهاتف</label>
              <div className="relative">
                <input name="phoneNumber" type="tel" className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="01XXXXXXXXX" value={formData.phoneNumber} onChange={handleChange} required />
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              </div>
              <p className="text-xs text-gray-400 text-right mr-2">* يجب أن يتكون من 11 رقم باللغة الإنجليزية ويبدأ بـ 01.</p>
            </div>

            {/* كلمات المرور */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* تأكيد كلمة المرور */}
              <div className="space-y-2">
                <label className="block text-gray-800 font-bold mr-2 text-sm text-right">تاكيد كلمة المرور</label>
                <div className="relative">
                  <input name="confirmPassword" type={showPass ? "text" : "password"} className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="............" value={formData.confirmPassword} onChange={handleChange} required />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-800 font-bold mr-2 text-sm text-right">كلمة المرور</label>
                <div className="relative">
                  <input name="password" type={showPass ? "text" : "password"} className="w-full bg-[#e5e7eb] border-none rounded-xl py-4 pr-12 pl-12 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="............" value={formData.password} onChange={handleChange} required />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-right mr-2">* على الأقل 6 خانات تشمل حرف كابيتال (A)، حرف سمول (a)، ورقم.</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 text-lg">
              {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "تسجيل حساب جديد"}
            </button>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-800 font-bold">لديك حساب بالفعل؟ <Link to="/login" className="text-blue-600 hover:underline mr-1 transition-all">تسجيل الدخول</Link></p>
            </div>
          </form>
        ) : (
          /* واجهة الـ OTP للتحقق */
          <form className="max-w-md mx-auto text-center space-y-6 animate-fade-in" onSubmit={handleVerifyOTP} dir="rtl">
            <div className="flex justify-center mb-4">
               <div className="bg-blue-50 p-6 rounded-full text-blue-600"><FileDigit size={48} /></div>
            </div>
            <p className="text-gray-500 text-lg">أدخل كود التحقق المرسل إلى <br/><span className="text-gray-900 font-black" dir="ltr">{formData.email}</span></p>
            <div className="relative">
              <input type="text" className="w-full bg-[#e5e7eb] border-none rounded-xl py-5 text-center text-3xl tracking-[0.5em] font-black outline-none focus:ring-2 focus:ring-blue-500" placeholder="000000" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black py-4 rounded-xl shadow-lg text-lg flex items-center justify-center gap-2">
              {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "تأكيد الحساب"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="text-gray-500 flex items-center justify-center gap-2 w-full font-bold hover:text-gray-800 transition-colors"><ArrowRight size={18} /> العودة لتعديل البيانات</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;