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
  const [time, setTime] = useState(0)

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

  useEffect(() => {
    let animationFrameId: number
    const animate = () => {
      setTime((prevTime) => prevTime + 0.01)
      animationFrameId = requestAnimationFrame(animate)
    }
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="absolute inset-0 w-full h-full transition-opacity duration-700"
        colors={["#001f3f", "#007bff", "#00c3ff", "#0a0a0a", "#1a1a2e"]}
        speed={isActive ? 0.6 : 0.25}
        backgroundColor="#000000"
        style={{
          opacity: isActive ? 1 : 0.9,
        }}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40 transition-opacity duration-500"
        colors={["#007bff", "#00c3ff", "#001f3f", "#000000"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
        style={{
          opacity: isActive ? 0.7 : 0.4,
        }}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen transition-all duration-300"
        colors={["#00c3ff", "#007bff", "#ffffff", "#001f3f"]}
        speed={0.4}
        backgroundColor="transparent"
        style={{
          transform: `translate(${(mousePosition.x - 0.5) * 40}px, ${(mousePosition.y - 0.5) * 40}px) scale(${isActive ? 1.05 : 1})`,
          opacity: isActive ? 0.6 : 0.3,
        }}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full mix-blend-overlay transition-opacity duration-1000"
        colors={["#00c3ff", "#ffffff", "#007bff", "#001f3f", "#000000"]}
        speed={0.1}
        backgroundColor="transparent"
        style={{
          opacity: 0.15 + Math.sin(time) * 0.1,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, transparent 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.6) 100%)`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle 600px at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(0, 195, 255, 0.15), transparent)`,
          opacity: isActive ? 1 : 0,
        }}
      />

      {children}
    </div>
  )
}
