import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ 
  iconUrl: markerIcon, 
  shadowUrl: markerShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

const LiveMap = () => {
  const [position, setPosition] = useState([30.0444, 31.2357]);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false); // لمعرفة نوع الحساب
  const [passengers, setPassengers] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [locationsInfo, setLocationsInfo] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mapRef = useRef();

  function MapUpdater({ center }) {
    const map = useMap();
    mapRef.current = map;
    useEffect(() => { map.flyTo(center, 15); }, [center, map]);
    return null;
  }

  // 1. تحديد نوع الحساب أول ما الصفحة تفتح من خلال ريكويست البروفايل للتحقق من رقم اللوحة
  useEffect(() => {
    const checkUserType = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("https://bmw943wz-7262.euw.devtunnels.ms/api/Account/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        // لو عنده رقم لوحة أو نوع الحساب سائق
        const isDriverUser = 
          data.userType === 1 || 
          data.userType === "1" || 
          data.role === "سائق" ||
          (data.plateNumber && data.plateNumber.trim() !== "");
        
        setIsDriver(isDriverUser);

        // لو سائق، نجيب لوكيشن الحالي فوراً ونعرض الركاب
        if (isDriverUser) {
          handleDriverLocation();
        } else {
          // لو راكب، نكتفي بجلب الجيولوكيشن العادي لعرض مكانه على الخريطة فقط
          getUserCurrentLocationOnly();
        }
      } catch (e) {
        console.error("Error checking user type:", e);
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
    fetchHotspots();
  }, []);

  // جلب موقع الراكب لمجرد العرض على الخريطة بدون تحديث السيرفر تلقائياً
  const getUserCurrentLocationOnly = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  // تجميع وتصنيف الركاب حسب المسافة (خاص بالسائق فقط)
  const categorizedGroups = useMemo(() => {
    if (!isDriver) return { under500: [], km1: [], km5: [], km10: [], above10: [] };
    const groups = [];
    passengers.forEach(p => {
      if (!p.lat || !p.lng) return;
      const dist = L.latLng(position[0], position[1]).distanceTo(L.latLng(p.lat, p.lng));

      let found = false;
      for (let g of groups) {
        const distanceBetween = L.latLng(p.lat, p.lng).distanceTo(L.latLng(g.lat, g.lng));
        if (distanceBetween < 150) {
          g.count += 1;
          g.lat = (g.lat * (g.count - 1) + p.lat) / g.count;
          g.lng = (g.lng * (g.count - 1) + p.lng) / g.count;
          g.distance = Math.round(dist);
          found = true;
          break;
        }
      }

      if (!found) {
        groups.push({
          groupId: p.userId,
          lat: p.lat,
          lng: p.lng,
          count: 1,
          distance: Math.round(dist)
        });
      }
    });

    return {
      under500: groups.filter(g => g.distance < 500),
      km1: groups.filter(g => g.distance >= 500 && g.distance < 1000),
      km5: groups.filter(g => g.distance >= 1000 && g.distance < 5000),
      km10: groups.filter(g => g.distance >= 5000 && g.distance < 10000),
      above10: groups.filter(g => g.distance >= 10000)
    };
  }, [passengers, position, isDriver]);

  const fetchPreciseLocation = async (lat, lng, id) => {
    if (locationsInfo[id]) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: { format: 'json', lat, lon: lng, "accept-language": "ar", addressdetails: 1, zoom: 18 },
        headers: { 'User-Agent': 'RideMatchingApp/1.0' }
      });
      const addr = res.data.address;
      setLocationsInfo(prev => ({ 
        ...prev, 
        [id]: {
          name: addr.road || addr.neighbourhood || addr.suburb || addr.city || "مكان غير مسمى",
          fullAddress: res.data.display_name?.split(',').slice(0, 3).join(', ') || ""
        }
      }));
    } catch (e) {
      setLocationsInfo(prev => ({ ...prev, [id]: { name: "غير معروف", fullAddress: "" } }));
    }
  };

  const fetchHotspots = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://bmw943wz-7262.euw.devtunnels.ms/api/RideMatching/hotspots", 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHotspots(res.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchPassengers = async (lat, lng) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://bmw943wz-7262.euw.devtunnels.ms/api/RideMatching/active-passengers",
        { params: { lat, lng }, headers: { Authorization: `Bearer ${token}` } }
      );
      setPassengers(res.data || []);
    } catch (e) { console.error(e); }
  };

  // لوكيشن السائق
  const handleDriverLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        try {
          const token = localStorage.getItem("token");
          await axios.post("https://bmw943wz-7262.euw.devtunnels.ms/api/RideMatching/update-location",
            { lat: latitude, lng: longitude, isSharingLive: true, userType: "Driver" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await Promise.all([fetchPassengers(latitude, longitude), fetchHotspots()]);
        } catch (e) { console.error(e); }
      });
    }
  };

  // لوكيشن الراكب عند الضغط على الزر الخاص به
  const handlePassengerLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        try {
          const token = localStorage.getItem("token");
          await axios.post("https://bmw943wz-7262.euw.devtunnels.ms/api/RideMatching/update-location",
            { lat: latitude, lng: longitude, isSharingLive: true, userType: "Passenger" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire({ title: 'تم مشاركة موقعك!', text: 'موقعك متاح الآن للسائقين القريبين منك.', icon: 'success', timer: 2000, showConfirmButton: false });
        } catch (e) {
          console.error(e);
          Swal.fire({ title: 'خطأ', text: 'فشل في إرسال موقعك الحالي.', icon: 'error' });
        }
      });
    }
  };

  const goToLocation = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 17, { duration: 1.5 });
    }
  };

  useEffect(() => {
    if (!isDriver) return;
    const allGroups = [
      ...categorizedGroups.under500,
      ...categorizedGroups.km1,
      ...categorizedGroups.km5,
      ...categorizedGroups.km10,
      ...categorizedGroups.above10
    ];
    allGroups.forEach(g => {
      const id = g.groupId;
      if (g.lat && g.lng) fetchPreciseLocation(g.lat, g.lng, id);
    });
  }, [categorizedGroups, isDriver]);

  if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-5xl text-blue-600" /></div>;

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-['Cairo'] overflow-hidden" dir="rtl">
      
      {/* السايد بار - يظهر فقط إذا كان المستخدم سائق (isDriver === true) */}
      {isDriver && (
        <>
          <div className={`fixed inset-y-0 right-0 z-[9999] w-[85%] md:w-[380px] bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:relative h-full`}>

            <div className="sticky top-0 bg-white z-40 border-b p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">الركاب المتاحون</h2>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-3xl">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <p className="text-3xl font-black text-blue-600">{passengers.length}</p>
                  <p className="text-xs text-gray-500">إجمالي الركاب</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl text-center">
                  <p className="text-3xl font-black text-orange-600">{hotspots.length}</p>
                  <p className="text-xs text-gray-500">نقاط ساخنة</p>
                </div>
              </div>

              <button onClick={handleDriverLocation} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-3xl font-bold text-lg shadow">
                📍 هات مكاني والركاب
              </button>

              <h3 className="font-bold text-gray-600">الركاب حسب المسافة:</h3>

              {/* مجموعات الركاب */}
              {categorizedGroups.under500.length > 0 && (
                <div>
                  <p className="text-orange-600 font-bold mb-3">🟠 أقل من 500 متر</p>
                  {categorizedGroups.under500.map(g => {
                    const info = locationsInfo[g.groupId] || {};
                    return (
                      <div key={g.groupId} onClick={() => { goToLocation(g.lat, g.lng); if (window.innerWidth < 768) setSidebarOpen(false); }} className="mb-4 p-5 bg-orange-50 rounded-3xl flex gap-4 cursor-pointer hover:bg-orange-100 transition">
                        <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0">{g.count}</div>
                        <div><p className="font-bold text-xl">{g.count} - {info.name}</p><p className="text-gray-600 text-sm">{info.fullAddress}</p></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {categorizedGroups.km1.length > 0 && (
                <div>
                  <p className="text-orange-600 font-bold mb-3">🟠 500 متر - 1 كيلو</p>
                  {categorizedGroups.km1.map(g => {
                    const info = locationsInfo[g.groupId] || {};
                    return (
                      <div key={g.groupId} onClick={() => { goToLocation(g.lat, g.lng); if (window.innerWidth < 768) setSidebarOpen(false); }} className="mb-4 p-5 bg-orange-50 rounded-3xl flex gap-4 cursor-pointer hover:bg-orange-100 transition">
                        <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0">{g.count}</div>
                        <div><p className="font-bold text-xl">{g.count} - {info.name}</p><p className="text-gray-600 text-sm">{info.fullAddress}</p></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {categorizedGroups.km5.length > 0 && (
                <div>
                  <p className="text-orange-600 font-bold mb-3">🟠 1 - 5 كيلو</p>
                  {categorizedGroups.km5.map(g => {
                    const info = locationsInfo[g.groupId] || {};
                    return (
                      <div key={g.groupId} onClick={() => { goToLocation(g.lat, g.lng); if (window.innerWidth < 768) setSidebarOpen(false); }} className="mb-4 p-5 bg-orange-50 rounded-3xl flex gap-4 cursor-pointer hover:bg-orange-100 transition">
                        <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0">{g.count}</div>
                        <div><p className="font-bold text-xl">{g.count} - {info.name}</p><p className="text-gray-600 text-sm">{info.fullAddress}</p></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-[999] md:hidden" onClick={() => setSidebarOpen(false)} />}
        </>
      )}

      {/* منطقة الخريطة */}
      <div className="flex-1 relative h-full z-10 flex flex-col">
        {/* هيدر للموبايل يظهر للسائق فقط ليفتح منه السايدبار */}
        {isDriver && (
          <div className="md:hidden w-full bg-white z-[990] p-4 shadow-md flex justify-between items-center shrink-0">
            <h1 className="font-bold text-xl">خريطة الركاب</h1>
            <button onClick={() => setSidebarOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-bold">الركاب</button>
          </div>
        )}

        {/* عرض الخريطة */}
        <div className="flex-1 w-full h-full relative">
          <MapContainer center={position} zoom={14} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} />

            {/* عرض دوائر الركاب فقط إذا كان المستخدم سائق */}
            {isDriver && [...categorizedGroups.under500, ...categorizedGroups.km1, ...categorizedGroups.km5, 
              ...categorizedGroups.km10, ...categorizedGroups.above10].map(g => (
              <Circle 
                key={g.groupId} 
                center={[g.lat, g.lng]} 
                radius={80 + g.count * 35} 
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.45 }}
              >
                <Tooltip permanent direction="top">{g.count} راكب</Tooltip>
              </Circle>
            ))}

            <MapUpdater center={position} />
          </MapContainer>

          {/* زر "هات مكاني" المخصص للراكب فقط - يظهر عائماً أسفل الخريطة وبشكل كامل */}
          {!isDriver && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-[400px]">
              <button 
                onClick={handlePassengerLocationShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 transition transform active:scale-95"
              >
                <FaMapMarkerAlt className="text-xl animate-bounce" />
                هات مكاني ومشاركة كموقع راكب
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;