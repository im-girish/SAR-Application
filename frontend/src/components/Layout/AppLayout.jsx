import React from "react";
import backgroundImage from "../../assets/military-background.jpg";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen text-emerald-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* REMOVE blur, keep a light transparent dark layer */}
      <div className="min-h-screen bg-black/55">
        <Navbar />
        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
