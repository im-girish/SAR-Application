// src/components/layout/CommandMarquee.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import indiaFlag from "../../assets/Flag_of_India.svg.webp";

const CommandMarquee = () => {
  const location = useLocation();

  // Show only on Command Center (root path)
  if (location.pathname !== "/") return null;

  const message =
    "Welcome to Indian Military SAR Application by Team Giri Gani Chethan";

  return (
    <div className="w-full bg-slate-950/80 border-b border-emerald-500/40 overflow-hidden">
      <div className="relative flex items-center gap-3 py-2 px-4">
        {/* RECTANGULAR flag fully filling its box */}
        <div className="h-6 w-10 overflow-hidden border border-emerald-400/80 shadow-[0_0_14px_rgba(16,185,129,0.9)] shrink-0 bg-emerald-500/10">
          <img
            src={indiaFlag}
            alt="India flag"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Scrolling text */}
        <div className="overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-xs md:text-sm text-emerald-100 font-medium tracking-wide">
            {message} •&nbsp;{message} •&nbsp;{message} •&nbsp;{message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandMarquee;
