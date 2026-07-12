import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBell, FaUserCircle, FaFileAlt, FaHome, 
  FaBars, FaTimes, FaChevronLeft, FaPlusCircle 
} from 'react-icons/fa';
import { MdLiveTv } from 'react-icons/md';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;
  const toggleMenu = () => setIsOpen(!isOpen);

  // دالة الانتقال إلى صفحة الملف الشخصي (البروفايل)
  const goToProfile = () => {
    navigate('/dashboard/profile');
  };

  return (
    <header className="w-full font-['Cairo'] shadow-md sticky top-0 z-[1000]" dir="rtl">
      <nav className="bg-[#1e60d2] text-white h-[85px] md:h-[110px] flex items-center px-4 lg:px-20 relative">
        <div className="container mx-auto flex justify-between items-center">
          
          {/* اليمين: الهوية */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0e2a5e] p-1 rounded-full border-2 border-blue-400/30 shadow-lg shrink-0">
              <div className="w-[50px] h-[50px] md:w-[65px] md:h-[65px] rounded-full overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Rased" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="text-right flex flex-col justify-center">
              <span className="text-[10px] md:text-[12px] font-bold opacity-80 leading-tight">جمهورية مصر العربية</span>
              <span className="text-[13px] md:text-[15px] font-bold leading-tight">وزارة الداخلية</span>
              <span className="text-[15px] md:text-[17px] font-black text-[#ffda79] leading-tight">منظومة راصد</span>
            </div>
          </div>

          {/* المنتصف: روابط Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <NavItem to="/dashboard" icon={<FaHome />} label="الرئيسية" active={isActive('/dashboard')} />
            <NavItem to="/dashboard/live-map" icon={<MdLiveTv />} label="بث مباشر" active={isActive('/dashboard/live-map')} />
            <NavItem to="/dashboard/new-report" icon={<FaPlusCircle />} label="تقديم بلاغ" active={isActive('/dashboard/new-report')} />
            <NavItem to="/dashboard/reports" icon={<FaFileAlt />} label="بلاغاتي" active={isActive('/dashboard/reports')} />
          </div>

          {/* الشمال: أيقونة البروفايل + زر البرجر */}
          <div className="flex items-center gap-3">
            {/* عند الضغط هنا، يتم الانتقال لصفحة البروفايل فوراً */}
            <button 
              onClick={goToProfile}
              className={`p-3 rounded-full transition-all relative focus:outline-none ${
                isActive('/dashboard/profile') ? 'bg-[#ffda79] text-[#0e2a5e] scale-105 shadow-md' : 'hover:bg-white/10 text-white'
              }`}
              title="حسابي الشخصي"
            >
              <FaUserCircle className="text-2xl" />
            </button>

            <button 
              onClick={toggleMenu}
              className="lg:hidden p-2.5 text-2xl hover:bg-white/10 rounded-xl transition-all"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar للموبايل */}
      <>
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={toggleMenu}
        ></div>

        <div className={`fixed top-0 right-0 h-full w-[300px] bg-[#0e2a5e] z-[1001] shadow-2xl transition-transform duration-400 lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
                <span className="font-black text-[#ffda79] text-xl">راصد</span>
              </div>
              <button onClick={toggleMenu} className="text-white bg-white/10 p-2 rounded-lg hover:bg-red-500 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <SidebarLink to="/dashboard" icon={<FaHome />} label="الرئيسية" active={isActive('/dashboard')} onClick={toggleMenu} />
              <SidebarLink to="/dashboard/live-map" icon={<MdLiveTv />} label="بث مباشر " active={isActive('/dashboard/live-map')} onClick={toggleMenu} />
              <SidebarLink to="/dashboard/new-report" icon={<FaPlusCircle />} label="تقديم بلاغ" active={isActive('/dashboard/new-report')} onClick={toggleMenu} />
              <SidebarLink to="/dashboard/reports" icon={<FaFileAlt />} label="بلاغاتي" active={isActive('/dashboard/reports')} onClick={toggleMenu} />
              <SidebarLink to="/dashboard/profile" icon={<FaUserCircle />} label="حسابي الشخصي" active={isActive('/dashboard/profile')} onClick={toggleMenu} />
            </div>

            <div className="mt-auto pt-6 border-t border-white/10 text-center">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">RASED SYSTEM v2.0</p>
            </div>
          </div>
        </div>
      </>

      {/* الشريط الإخباري */}
      <div className="bg-white border-b border-gray-100 h-[40px] flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-[#4b5563] font-black text-[12px] md:text-[13px] w-full justify-center">
          <span>وزارة الداخلية تطلق منظومة "راصد" للشكاوى الذكية ★ سرعة في الاستجابة ★ دقة في التنفيذ</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(-15%); }
          100% { transform: translateX(15%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite alternate;
        }
      `}</style>
    </header>
  );
};

const NavItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-[#ffda79] text-[#0e2a5e] font-black shadow-lg scale-105' : 'text-white hover:bg-white/10 font-bold'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-sm">{label}</span>
  </Link>
);

const SidebarLink = ({ to, icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${active ? 'bg-[#1e60d2] text-white shadow-xl translate-x-[-5px]' : 'text-gray-400 hover:bg-white/5'}`}
  >
    <div className="flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <span className="text-lg font-bold">{label}</span>
    </div>
    <FaChevronLeft className={`text-sm ${active ? 'text-[#ffda79]' : 'text-gray-600'}`} />
  </Link>
);

export default Navbar;