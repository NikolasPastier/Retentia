"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#001f3f", "#007bff", "#00c3ff", "#101010", "#ffffff"]}
        speed={0.25}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-50"
        colors={["#001f3f", "#007bff", "#00c3ff", "#000000"]}
        speed={0.15}
        wireframe="true"
        backgroundColor="transparent"
      />

      {children}
    </div>
  )
}
