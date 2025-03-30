"use client"

import React from "react"

export function UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div id="portal-root" />
    </>
  )
}
