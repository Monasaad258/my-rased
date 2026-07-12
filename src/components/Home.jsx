import React, { useState, useEffect } from 'react';
import { FaFileInvoice, FaMapMarkedAlt, FaBullhorn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);

  // تحديث الـ BASE_URL للرابط الجديد الخاص بكِ
  const BASE_URL = "https://bmw943wz-7262.euw.devtunnels.ms";

  useEffect(() => {
    const fetchAds = async () => {
      console.log("=== بداية تتبع جلب الإعلانات ===");
      
      // بناء الرابط النهائي المستهدف
      const targetUrl = `${BASE_URL}/api/Ads/active`;
      console.log("رابط الـ API المستهدف:", targetUrl);

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'bypass-tunnel-reminder': 'true'
          }
        });

        console.log("كود حالة الرد من السيرفر (Status Code):", response.status);

        if (!response.ok) {
          throw new Error(`فشل في جلب البيانات. الكود: ${response.status}`);
        }

        const data = await response.json();
        console.log("البيانات الراجعة بنجاح من السيرفر:", data);

        // التأكد من أن البيانات مصفوفة وإلا طباعة تحذير
        if (Array.isArray(data)) {
          setAds(data);
        } else {
          console.warn("تحذير: البيانات الراجعة ليست مصفوفة (Array)! شكل البيانات الحالي:", data);
          setAds([]);
        }

      } catch (error) {
        console.error("خطأ صريح أثناء الاتصال بالـ API (Catch Block):", error.message);
        console.error("تفاصيل الخطأ الكاملة:", error);
      } finally {
        setLoading(false);
        console.log("=== نهاية تتبع جلب الإعلانات ===");
      }
    };

    fetchAds();
  }, []);

  const getCorrectImageUrl = (url) => {
    if (!url) return null;
    // استبدال الـ localhost بالـ BASE_URL الجديد لعرض الصور بشكل صحيح
    return url.replace("https://localhost:7262", BASE_URL);
  };

  const mainAd = ads.length > 0 ? ads[0] : null;

  return (
    <div className="min-h-screen font-['Almarai'] overflow-x-hidden bg-slate-50" dir="rtl">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap');
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleUp { animation: scaleUp 0.3s ease-out forwards; }
        `}
      </style>

      <main className="w-full px-4 sm:px-10 lg:px-20 py-10 md:py-16 flex flex-col items-center">
        
        {/* قسم الإعلان المباشر */}
        {!loading && mainAd && (
          <div className="w-full max-w-[1400px] mb-16">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group cursor-default">
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={getCorrectImageUrl(mainAd.imageUrl)} 
                  alt={mainAd.title}
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 text-right">
                <div className="mb-3">
                  <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                    إعلان هام
                  </span>
                </div>
                <h2 className="text-3xl md:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight">
                  {mainAd.title}
                </h2>
                <p className="text-white/80 text-sm md:text-xl font-medium max-w-2xl leading-relaxed mb-6 line-clamp-2 md:line-clamp-none">
                  {mainAd.content || "اضغط على زر التفاصيل لمعرفة المزيد عن هذا الإعلان."}
                </p>
                <div className="flex">
                  <button 
                    onClick={() => setSelectedAd(mainAd)}
                    className="bg-white text-slate-900 px-8 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* حالة التحميل المؤقتة */}
        {loading && (
          <div className="w-full max-w-[1400px] mb-16 h-[400px] md:h-[500px] bg-slate-200 animate-pulse rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-slate-400 font-bold">
            جاري جلب الإعلانات النشطة...
          </div>
        )}

        {/* العناوين الأساسية */}
        <div className="text-center mb-16 space-y-6 max-w-5xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            منصة الشكاوى الحكومية الموحدة
          </h1>
          <p className="text-base md:text-2xl text-slate-600 max-w-3xl mx-auto font-light">
            بوابة إلكترونية ذكية تتيح للمواطنين تقديم البلاغات ومتابعتها بكل سهولة وشفافية
          </p>
        </div>

        {/* كروت الخدمات الموجهة للمسارات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 w-full max-w-[1400px]">
          
          {/* كرت متابعة البلاغات */}
          <Card 
            color="border-amber-400" 
            title="متابعة البلاغات" 
            icon={<FaFileInvoice/>} 
            desc="الاستعلام عن حالة البلاغات السابقة ومعرفة الإجراءات المتخذة" 
            onClick={() => navigate('/dashboard/reports')} 
          />
          
          {/* كرت لايف دلوقتي */}
          <Card 
            color="border-blue-500" 
            title="بث مباشر" 
            icon={<FaMapMarkedAlt/>} 
            desc="شارك موقعك الان" 
            onClick={() => navigate('/dashboard/live-map')} 
          />
          
          {/* كرت تقديم بلاغ */}
          <Card 
            color="border-slate-800" 
            title="تقديم بلاغ" 
            icon={<FaBullhorn/>} 
            desc="إبلاغ فوري عن المخالفات او حادث مع إمكانية رفع المرفقات وتحديد الموقع" 
            onClick={() => navigate('/dashboard/new-report')} 
          />
          
        </div>
      </main>

      {selectedAd && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative h-48 md:h-80 w-full overflow-hidden">
              <img 
                src={getCorrectImageUrl(selectedAd.imageUrl)} 
                className="w-full h-full object-cover object-center"
                alt={selectedAd.title} 
              />
              <button 
                onClick={() => setSelectedAd(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/20 backdrop-blur-xl text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all shadow-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-8 md:p-12 text-right">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{selectedAd.title}</h3>
              <p className="text-slate-600 text-sm md:text-lg leading-relaxed mb-8">
                {selectedAd.content || "لا يوجد وصف إضافي متاح حالياً لهذا الإعلان."}
              </p>
              <button 
                onClick={() => setSelectedAd(null)}
                className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-blue-600 transition-all shadow-lg"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({ color, title, icon, desc, onClick }) => (
  <div onClick={onClick} className={`group bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border-t-[10px] md:border-t-[12px] ${color} flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer h-full`}>
    <div className="mb-6 md:mb-8 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white shadow-inner">
      <span className="text-3xl md:text-4xl">{icon}</span>
    </div>
    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-slate-500 text-sm md:text-lg leading-relaxed font-light">{desc}</p>
  </div>
);

export default Home;