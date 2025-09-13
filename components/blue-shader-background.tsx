"use client"

import { useEffect, useRef } from "react"

export default function BlueShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create animated blue gradient mesh
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 200,
        canvas.height / 2 + Math.cos(time * 0.7) * 150,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8,
      )

      gradient.addColorStop(0, `rgba(59, 130, 246, ${0.3 + Math.sin(time) * 0.1})`) // Blue-500
      gradient.addColorStop(0.3, `rgba(37, 99, 235, ${0.2 + Math.cos(time * 0.8) * 0.05})`) // Blue-600
      gradient.addColorStop(0.6, `rgba(29, 78, 216, ${0.15 + Math.sin(time * 1.2) * 0.05})`) // Blue-700
      gradient.addColorStop(1, "rgba(30, 58, 138, 0.05)") // Blue-900

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add floating particles
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time + i) * canvas.width) / 4 + canvas.width / 2
        const y = (Math.cos(time * 0.8 + i) * canvas.height) / 4 + canvas.height / 2
        const size = Math.sin(time + i) * 2 + 3

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 197, 253, ${0.1 + Math.sin(time + i) * 0.05})` // Blue-300
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1e3a8a 50%, #0a0a0a 100%)" }}
    />
  )
}
