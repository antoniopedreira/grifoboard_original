
import React from "react";

const Header = () => {
  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">GrifoBoard</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
