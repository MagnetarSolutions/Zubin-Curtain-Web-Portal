import React, { useState } from "react";
import { PhoneCall } from "lucide-react";

const Header = () => {
  const [active, setActive] = useState("Home");

  const menuItems = ["Home"];

  return (
    <header className="w-full bg-DarkBlue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        
       
        <div className="flex items-center">
          <div className="text-left leading-tight">
            <h1 className="text-2xl font-bold tracking-wide">GARDIS</h1>
            <p className="text-sm text-gray-300 text-center">Curtains</p>
          </div>
        </div>

     
        <nav className="hidden md:flex space-x-8 text-gray-300 font-medium">
          {menuItems.map((item) => (
            <a
              key={item}
              href="#"
              onClick={() => setActive(item)}
              className={`relative transition-colors duration-300 ${
                active === item ? "text-white" : "text-gray-300"
              } after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-yellow-500 after:transition-all after:duration-300
                ${active === item ? "after:w-[44px]" : "after:w-0 hover:after:w-[44px]"}`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <PhoneCall className="text-blue-400" size={20} />
          <span className="text-white font-medium">800 123 4567</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
