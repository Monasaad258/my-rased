import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FaMapMarkerAlt, FaCamera, FaVideo, FaSpinner, 
  FaCheckCircle, FaTimes, FaListUl, FaCar, FaExclamationTriangle, FaInfoCircle, FaLock
} from 'react-icons/fa';

// حل مشكلة أيقونات Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16, { animate: true });
  }, [position, map]);
  return null;
};

const MapEvents = ({ setMapPosition, setLocationText, setIsLoadingLoc }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMapPosition([lat, lng]);
      setIsLoadingLoc(true);
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`)
        .then(res => res.json())
        .then(data => {
          setLocationText(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setIsLoadingLoc(false);
        })
        .catch(() => setIsLoadingLoc(false));
    },
  });
  return null;
};

const NewReport = () => {
  const AI_BASE_URL = "https://ans2004-auto-completion.hf.space";
  const PLATE_API_URL = "https://rana-07-rased-plate-extraction.hf.space/predict";
  const BACKEND_API_URL = "https://bmw943wz-7262.euw.devtunnels.ms/api/Complaints"; 

  const [plateNumber, setPlateNumber] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  
  const [imageBase64, setImageBase64] = useState("");
  const [videoBase64, setVideoBase64] = useState("");

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [showFieldsRequiredModal, setShowFieldsRequiredModal] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false); 
  const [invalidReason, setInvalidReason] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [locationText, setLocationText] = useState(''); 
  const [mapPosition, setMapPosition] = useState([31.0409, 31.3785]); 
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  const [complaintsList, setComplaintsList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const currentDate = new Intl.DateTimeFormat('ar-EG', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date());

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchAllComplaints = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoadingList(true);
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComplaintsList(data);
      }
    } catch (err) {
      console.error("Error fetching complaints list:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLoc(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMapPosition([latitude, longitude]);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar`)
          .then(res => res.json())
          .then(data => {
            setLocationText(data.display_name);
            setIsLoadingLoc(false);
          })
          .catch(() => setIsLoadingLoc(false));
      }, () => {
        alert("برجاء تفعيل تحديد الموقع في المتصفح");
        setIsLoadingLoc(false);
      });
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (complaintText.length < 3) { setSuggestions([]); return; }
      try {
        const response = await fetch(`${AI_BASE_URL}/complete`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: complaintText, n_suggestions: 3 })
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.completions || data.suggestions || []);
        }
      } catch (err) { console.error("Autocomplete Error"); }
    };
    const timer = setTimeout(fetchSuggestions, 500); 
    return () => clearTimeout(timer);
  }, [complaintText]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsLoadingAI(true);

    try {
      const base64Str = await convertFileToBase64(file);
      const cleanBase64 = base64Str.split(',')[1] || base64Str;
      setImageBase64(cleanBase64);

      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(PLATE_API_URL, { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok && (data.plate_text || data.all_plates)) {
        setPlateNumber(data.plate_text || data.all_plates[0]);
      }
    } catch (err) { 
      console.error("AI Plate Error", err); 
    } finally { 
      setIsLoadingAI(false); 
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoPreview(URL.createObjectURL(file));
    try {
      const base64Str = await convertFileToBase64(file);
      const cleanBase64 = base64Str.split(',')[1] || base64Str;
      setVideoBase64(cleanBase64);
    } catch (err) {
      console.error("Video Base64 error", err);
    }
  };

  const handleSubmitReport = async () => {
    if (!complaintText || !plateNumber || !locationText) { 
      setShowFieldsRequiredModal(true);
      return; 
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setShowUnauthorizedModal(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. فحص النص بالذكاء الاصطناعي
      const analyzeResponse = await fetch("https://ans2004-auto-completion.hf.space/analyze", {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: complaintText })
      });

      if (!analyzeResponse.ok) {
        throw new Error("فشل في فحص نص الشكوى عبر الذكاء الاصطناعي");
      }

      const analyzeData = await analyzeResponse.json();

      if (analyzeData.valid === 0) {
        setInvalidReason(analyzeData.category || "محتوى غير متعلق بالمخالفات المرورية");
        setShowInvalidModal(true); 
        setIsSubmitting(false);
        return; 
      }

      // 2. تم تضمين رقم اللوحة هنا بشكل سليم ومزدوج للتوافق مع أي مسمى بالـ Backend
      const reportData = {
        description: complaintText,
        plateNumber: plateNumber, 
        plate_number: plateNumber,
        image: imageBase64 || "string", 
        video: videoBase64 || "string",
        lng: parseFloat(mapPosition[1]) || 0,
        lat: parseFloat(mapPosition[0]) || 0,
        location: locationText
      };
      
      // 3. الإرسال إلى السيرفر الخاص بك
      const response = await fetch(BACKEND_API_URL, { 
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify(reportData) 
      });
      
      if (response.ok) {
        setShowSuccess(true);
        fetchAllComplaints(); 
        // تصفير النموذج
        setPlateNumber('');
        setImagePreview(null);
        setVideoPreview(null);
        setImageBase64("");
        setVideoBase64("");
        setComplaintText('');
        setLocationText('');
      } else if (response.status === 401) {
        setShowUnauthorizedModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server Error Details:", errorData);
        alert(errorData.message || `فشل الإرسال: كود الخطأ ${response.status}`);
      }
    } catch (err) { 
      console.error("Submit Error:", err);
      alert(`حدث خطأ أثناء الاتصال بالسيرفر: ${err.message}`); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      
      {/* مودال الخريطة */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black text-xl">تحديد مكان الواقعة</h3>
              <button type="button" onClick={() => setIsMapOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-red-500 transition-all"><FaTimes size={20}/></button>
            </div>

            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
              <button 
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full p-6 bg-blue-600 text-white rounded-3xl shadow-xl flex items-center justify-center gap-4 hover:bg-blue-700 transition-all font-black text-xl"
              >
                {isLoadingLoc ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt size={24} />}
                أنا في موقع المخالفة الآن
              </button>

              <div className="h-64 w-full rounded-[25px] overflow-hidden border-2 border-slate-200 shadow-md relative z-10">
                <MapContainer center={mapPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={mapPosition} />
                  <RecenterMap position={mapPosition} />
                  <MapEvents setMapPosition={setMapPosition} setLocationText={setLocationText} setIsLoadingLoc={setIsLoadingLoc} />
                </MapContainer>
              </div>

              <div className="space-y-3">
                <label className="font-black text-slate-700">تفاصيل الموقع:</label>
                <textarea 
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="العنوان التفصيلي للواقعة..."
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[25px] text-lg font-bold outline-none focus:border-blue-500 h-32 resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-white border-t shrink-0">
              <button type="button" onClick={() => setIsMapOpen(false)} disabled={!locationText || isLoadingLoc} className="w-full py-5 rounded-2xl font-black text-xl bg-slate-900 text-white disabled:bg-slate-300">
                تأكيد ومتابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* النموذج الرئيسي */}
      <div className="max-w-4xl mx-auto bg-white rounded-[50px] shadow-2xl overflow-hidden mb-12">
        <header className="bg-blue-600 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black">رصـد | Rased</h1>
            <p className="text-blue-100 font-bold mt-1">نظام الإبلاغ عن المخالفات المرورية</p>
          </div>
          <div className="bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md text-center">
            <span className="text-lg font-bold">{currentDate}</span>
          </div>
        </header>

        <div className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="font-black text-slate-700">1. صورة اللوحة (مطلوب)</label>
              <div className="h-48 border-4 border-dashed border-slate-100 rounded-[30px] bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {imagePreview ? <img src={imagePreview} className="h-full w-full object-contain p-4" alt="preview" /> : <FaCamera className="text-slate-200" size={50} />}
                {isLoadingAI && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><FaSpinner className="animate-spin text-blue-600" size={30} /></div>}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="font-black text-slate-700">2. الفيديو (اختياري)</label>
              <div className="h-48 border-4 border-dashed border-slate-100 rounded-[30px] bg-slate-50 flex items-center justify-center relative overflow-hidden">
                {!videoPreview ? <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" /> : <video src={videoPreview} controls className="h-full w-full object-cover" />}
                {!videoPreview && <FaVideo className="text-slate-200" size={50} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="font-black text-slate-700">3. رقم اللوحة المستخرج</label>
              <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} className="w-full p-5 bg-slate-100 rounded-2xl text-center font-black text-2xl text-blue-600" />
            </div>
            <div className="space-y-3">
              <label className="font-black text-slate-700">4. مكان الشكوي</label>
              <button type="button" onClick={() => setIsMapOpen(true)} className="w-full p-5 bg-slate-100 rounded-2xl flex justify-between items-center font-bold text-slate-600">
                <span className="truncate w-4/5 text-right">{locationText || "اضغط لتحديد مكان الشكوي"}</span>
                <FaMapMarkerAlt className="text-red-500" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="font-black text-slate-700">5. وصف المخالفة</label>
            <textarea rows="4" value={complaintText} onChange={(e) => setComplaintText(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[30px] outline-none font-bold border-2 border-transparent focus:border-blue-500" placeholder="اكتب تفاصيل المخالفة..."></textarea>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button type="button" key={i} onClick={() => setComplaintText(prev => prev + " " + s)} className="px-4 py-2 bg-blue-50 rounded-full text-xs font-bold text-blue-600 border border-blue-100">+ {s}</button>
              ))}
            </div>
          </div>

          <button type="button" disabled={isSubmitting} onClick={handleSubmitReport} className="w-full py-6 bg-blue-600 text-white rounded-[30px] text-2xl font-black shadow-xl">
            {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : "تقديم البلاغ الرسمي"}
          </button>
        </div>
      </div>

      {/* بوب اب نجاح الإرسال */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">تم الإرسال بنجاح</h2>
            <button type="button" onClick={() => setShowSuccess(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-2 shadow-lg shadow-blue-100">بداية جديدة</button>
          </div>
        </div>
      )}

      {/* بوب اب رفض محتوى الشكوى غير الصالحة */}
      {showInvalidModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-t-8 border-red-500">
            <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2 text-slate-800">محتوى غير صالح</h2>
            <p className="text-slate-600 font-bold mb-6 text-sm leading-relaxed">
              عذراً، نظام الفحص التلقائي وجد أن نص البلاغ غير متعلق بالمخالفات المرورية.
              <br />
              <span className="text-red-600 block mt-2 font-black">التصنيف الحالي: {invalidReason}</span>
            </p>
            <button type="button" onClick={() => setShowInvalidModal(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg">
              تعديل النص والمحاولة مجدداً
            </button>
          </div>
        </div>
      )}

      {/* بوب اب "أدخل البيانات كاملة" */}
      {showFieldsRequiredModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-t-8 border-amber-500">
            <FaInfoCircle className="text-amber-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2 text-slate-800">بيانات غير مكتملة</h2>
            <p className="text-slate-600 font-bold mb-6 text-sm leading-relaxed">
              برجاء التأكد من إدخال كافة البيانات الأساسية المطلوبة:
              <br />
              <span className="text-slate-500 block mt-2 font-medium">(رقم اللوحة المستخرج - مكان الشكوى - وصف المخالفة)</span>
            </p>
            <button type="button" onClick={() => setShowFieldsRequiredModal(false)} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-colors">
              حسناً، سأكمل البيانات
            </button>
          </div>
        </div>
      )}

      {/* بوب اب جلسة منتهية أو غير مصرح به (401 Unauthorized) */}
      {showUnauthorizedModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-t-8 border-red-600">
            <FaLock className="text-red-600 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2 text-slate-800">جلسة غير صالحة</h2>
            <p className="text-slate-600 font-bold mb-6 text-sm leading-relaxed">
              عذراً، يبدو أنك لست مسجلاً للدخول أو انتهت صلاحية الجلسة الخاصة بك.
              <br />
              <span className="text-slate-400 block mt-1 text-xs">يرجى التأكد من تسجيل الدخول وإعادة المحاولة.</span>
            </p>
            <button type="button" onClick={() => setShowUnauthorizedModal(false)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-colors">
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default NewReport;