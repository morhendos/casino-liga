"use client";

import React from "react";

const AuthLogo = () => (
  <div className="flex flex-col items-center mb-8 select-none">
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center mb-2 rounded-full bg-primary/10">
        <img src="/logo-placeholder-image.png" alt="Padeliga Logo" className="h-20" />
      </div>
      <h1 className="text-2xl font-bold mb-1">Padeliga</h1>
      <p className="text-sm text-muted-foreground italic">Tu liga. Tu juego.</p>
    </div>
  </div>
);

export default AuthLogo;
