"use client";

import { useState } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeMain from "@/components/home/HomeMain";
import HomeFooter from "@/components/home/HomeFooter";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen">
      <HomeHeader 
        chg={toggleMenu}
      />
      <HomeMain isOpen={isMenuOpen} />
      <HomeFooter />
    </div>
  );
}
