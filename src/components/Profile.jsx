import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaRegCreditCard, FaRegEnvelope, FaShieldAlt, FaSignOutAlt, FaEdit, FaSave, FaSpinner, FaUsers, FaCar } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import LiveMap from '../components/LiveMap'; 

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  const [userData, setUserData] = useState({
    fullName: '',
    nationalId: '',
    email: '',
    role: 'مواطن / راكب',
    userType: 0,
    plateNumber: '' 
  });

  const [isEditing, setIsEditing] = useState(false);

  const API_URL = "https://bmw943wz-7262.euw.devtunnels.ms/api/Account/profile";

  const normalizePlate = (plate) => {
    if (!plate) return '';
    return plate
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '')
      .replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632));
  };

  // جلب البيانات + تحديد نوع المستخدم
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          const data = response.data;
          console.log("Profile Data From Server:", data);

          const isDriverUser = 
            data.userType === 1 || 
            data.userType === "1" || 
            data.role === "سائق" ||
            data.role === "سائق مركبة" ||
            (data.plateNumber && data.plateNumber.trim() !== "");

          const currentType = isDriverUser ? 1 : 0;

          setIsDriver(isDriverUser);

          setUserData({
            fullName: data.fullName || data.name || 'مستخدم راصد',
            nationalId: data.nationalId || data.ssn || 'لا يوجد رقم قومي مسجل',
            email: data.email || 'لا يوجد بريد مسجل',
            userType: currentType,
            role: currentType === 1 ? 'سائق مركبة' : 'مواطن / راكب',
            plateNumber: data.plateNumber || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Swal.fire({ title: 'خطأ!', text: 'فشل في جلب البيانات', icon: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem("token");
    setSubmitting(true);

    const updatePayload = {
      fullName: userData.fullName.trim(),
      nationalId: userData.nationalId.trim(),
      email: userData.email.trim().toLowerCase(),
      userType: userData.userType
    };

    if (userData.userType === 1) {
      updatePayload.plateNumber = normalizePlate(userData.plateNumber);
    }

    try {
      const response = await axios.put(API_URL, updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 || response.status === 204) {
        Swal.fire({
          title: 'تم التحديث!',
          text: 'تم حفظ تعديلات ملفك الشخصي بنجاح.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        title: 'خطأ!',
        text: error.response?.data?.message || 'فشل تحديث البيانات',
        icon: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#e5e7eb]">
        <FaSpinner className="animate-spin text-4xl text-[#1e60d2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-['Cairo']" dir="rtl">
      {/* Profile Content */}
      <div className="flex justify-center items-center py-10 px-4">
        <div className="bg-white w-full max-w-[680px] rounded-[24px] shadow-sm overflow-hidden border border-gray-100 relative pb-12">
          <div className="bg-[#1e60d2] h-36 w-full"></div>

          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="bg-[#f3f4f6] w-32 h-32 rounded-full border-[5px] border-white flex items-center justify-center shadow-sm">
              <FaUser className="text-[#6b7280] text-5xl" />
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="pt-20 px-8 sm:px-14 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 mt-4 group">
              {isEditing ? (
                <input 
                  type="text"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  className="text-2xl font-bold text-gray-850 text-center bg-gray-50 border border-blue-400 rounded-xl px-3 py-1 outline-none"
                  required
                />
              ) : (
                <h2 className="text-2xl font-bold text-[#111827]">{userData.fullName}</h2>
              )}
              <button 
                type="button" 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-gray-400 hover:text-blue-600 transition-colors text-sm"
              >
                {isEditing ? <span className="text-xs bg-gray-200 text-gray-750 px-2 py-0.5 rounded">إلغاء</span> : <FaEdit />}
              </button>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 mb-8 shadow-sm ${userData.userType === 1 ? 'bg-amber-100 text-amber-700' : 'bg-[#cddbf7] text-[#1e60d2]'}`}>
              <span>{userData.role}</span>
              <FaUsers className="text-sm" />
            </div>

            <div className="w-full space-y-5">
              <div className="bg-[#f4f4f5] p-5 rounded-[14px] flex justify-between items-center px-6">
                <div className="text-right flex-1">
                  <p className="text-xs text-gray-450 font-bold mb-1">الرقم القومي</p>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={userData.nationalId}
                      onChange={(e) => setUserData({ ...userData, nationalId: e.target.value })}
                      className="w-full text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                      maxLength={14}
                      required
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 tracking-wider">{userData.nationalId}</p>
                  )}
                </div>
                <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-gray-700 shrink-0 mr-4">
                  <FaRegCreditCard className="text-xl" />
                </div>
              </div>

              <div className="bg-[#f4f4f5] p-5 rounded-[14px] flex justify-between items-center px-6">
                <div className="text-right flex-1">
                  <p className="text-xs text-gray-450 font-bold mb-1">البريد الإلكتروني</p>
                  {isEditing ? (
                    <input 
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="w-full text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500 text-left"
                      required
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800">{userData.email}</p>
                  )}
                </div>
                <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-gray-700 shrink-0 mr-4">
                  <FaRegEnvelope className="text-xl" />
                </div>
              </div>

              {userData.userType === 1 && (
                <div className="bg-[#f4f4f5] p-5 rounded-[14px] flex justify-between items-center px-6 transition-all duration-300">
                  <div className="text-right flex-1">
                    <p className="text-xs text-gray-450 font-bold mb-1">رقم لوحة السيارة</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={userData.plateNumber}
                        onChange={(e) => setUserData({ ...userData, plateNumber: e.target.value })}
                        className="w-full text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                        placeholder="أ ب ج 1 2 3"
                        required
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{userData.plateNumber}</p>
                    )}
                  </div>
                  <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-amber-600 shrink-0 mr-4">
                    <FaCar className="text-xl" />
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full mt-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-base"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                حفظ التغييرات
              </button>
            )}

            <div className="flex items-center gap-2 text-[#22c55e] font-bold text-sm my-8">
              <p>حسابك موثق وآمن تماماً</p>
              <FaShieldAlt className="text-base" />
            </div>

            <button 
              type="button"
              onClick={handleLogout}
              className="w-full p-4 rounded-[14px] bg-[#fbfbfc] border border-gray-50 text-[#ef4444] font-bold flex items-center justify-center gap-2 hover:bg-red-50/50 transition-all shadow-2xs text-base"
            >
              <span className="text-base">خروج من الحساب</span>
              <FaSignOutAlt className="text-lg" />
            </button>
          </form>
        </div>
      </div>


    </div>
  );
};

export default Profile;