import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ComplaintTrack = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('https://bmw943wz-7262.euw.devtunnels.ms/api/Complaints/my-complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://bmw943wz-7262.euw.devtunnels.ms/api/Complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedComplaint(res.data);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error(err);
      setSelectedComplaint({
        id,
        description: "السواقة متهورة قوي والسرعة عالية جداً",
        location: "شارع الهرم، الجيزة",
        plateNumber: "س ص ع ٥٦٧٨",
        date: "2025/01/17",
        status: "تحت المراجعة",
        updateText: "تم استلام الشكوى وجاري التدقيق."
      });
      setIsDetailsOpen(true);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    (c.id || '').toString().includes(searchTerm) ||
    (c.plateNumber || '').includes(searchTerm) ||
    (c.description || '').includes(searchTerm)
  );

  const formatComplaintId = (id) => {
    if (!id) return '';
    const str = id.toString();
    return str.length > 5 ? '#' + str.slice(-5) : '#' + str;
  };

  const getStatusBadge = (status) => {
    if (status === 'Resolved' || status === 'Approved') {
      return <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">تم الحل</span>;
    }
    return <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">جاري المعالجة</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-['Cairo'] p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">سجل البلاغات</h1>
            <p className="text-gray-500 mt-1">تابع حالة بلاغاتك المقدمة</p>
          </div>

          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="ابحث برقم البلاغ أو اللوحة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl py-3 px-5 pl-12 focus:outline-none focus:border-blue-500"
            />
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* Desktop Table (Only visible on Large Laptop Screens & Desktops) */}
        <div className="hidden lg:block bg-white rounded-3xl shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-5 text-right font-bold text-gray-700">رقم البلاغ</th>
                    <th className="p-5 text-right font-bold text-gray-700">تاريخ البلاغ</th>
                    <th className="p-5 text-right font-bold text-gray-700">الوصف</th>
                    <th className="p-5 text-center font-bold text-gray-700">الحالة</th>
                    <th className="p-5 text-center font-bold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-gray-500">
                        لا توجد بلاغات
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-5 font-bold text-gray-800">{formatComplaintId(c.id)}</td>
                        <td className="p-5 text-gray-600">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '---'}
                        </td>
                        <td className="p-5 text-gray-700 max-w-md truncate">{c.description}</td>
                        <td className="p-5 text-center">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => fetchComplaintDetails(c.id)}
                            className="text-blue-600 hover:underline font-medium whitespace-nowrap"
                          >
                            عرض التفاصيل
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile & Tablet Cards (Grid view prevents horizontal scrolling) */}
        <div className="lg:hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500 font-medium">
              لا توجد بلاغات
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => fetchComplaintDetails(c.id)}
                  className="bg-white rounded-3xl p-6 shadow hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div>
                      <span className="font-bold text-2xl text-gray-900">{formatComplaintId(c.id)}</span>
                      <p className="text-sm text-gray-500 mt-1">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '---'}
                      </p>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <p className="text-gray-700 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="text-blue-600 text-sm font-medium mt-4 flex items-center gap-1">
                    عرض التفاصيل ←
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup Details */}
      {isDetailsOpen && selectedComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg md:max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">تفاصيل البلاغ</h2>
                <p className="text-slate-400 text-sm mt-1">{formatComplaintId(selectedComplaint.id)}</p>
              </div>
              <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="text-2xl p-2 leading-none text-slate-400 hover:text-red-400 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-gray-500 text-sm mb-2">الوصف</p>
                <p className="text-base md:text-lg leading-relaxed font-medium text-gray-800">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">رقم اللوحة</p>
                  <p className="font-bold text-xl text-blue-600">{selectedComplaint.plateNumber || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">الموقع</p>
                  <p className="font-medium text-gray-800">{selectedComplaint.location || 'غير متوفر'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">التحديث الأخير</p>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-gray-700">{selectedComplaint.updateText || 'لا توجد تحديثات جديدة بعد.'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintTrack;