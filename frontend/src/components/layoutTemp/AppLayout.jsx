// D:\SAR-APP\frontend\src\components\layout\AppLayout.jsx
import React from "react";
import backgroundImage from "../../assets/military-background.jpg";
import Navbar from "./Navbar";
import CommandMarquee from "./CommandMarquee";

const AppLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen text-emerald-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-black/55">
        <Navbar />
        <CommandMarquee /> {/* moving text only on Command Center */}
        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
