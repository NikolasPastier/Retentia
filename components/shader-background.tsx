"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        })
      }
    }

    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="absolute inset-0 w-full h-full transition-opacity duration-700"
        colors={["#001f3f", "#007bff", "#00c3ff", "#0a0a0a", "#1a1a2e"]}
        speed={isActive ? 0.4 : 0.2}
        backgroundColor="#000000"
        style={{
          opacity: isActive ? 1 : 0.85,
        }}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40 transition-opacity duration-500"
        colors={["#007bff", "#00c3ff", "#001f3f", "#000000"]}
        speed={0.15}
        wireframe="true"
        backgroundColor="transparent"
        style={{
          opacity: isActive ? 0.6 : 0.3,
        }}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen transition-all duration-300"
        colors={["#00c3ff", "#007bff", "#ffffff", "#001f3f"]}
        speed={0.35}
        backgroundColor="transparent"
        style={{
          transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
          opacity: isActive ? 0.5 : 0.2,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />

      {children}
    </div>
  )
}
