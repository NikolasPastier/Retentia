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
      time += 0.02 // Increased animation speed for more visible movement

      // Clear canvas
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gradient1 = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 300,
        canvas.height / 2 + Math.cos(time * 0.7) * 200,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.6,
      )

      gradient1.addColorStop(0, `rgba(59, 130, 246, ${0.4 + Math.sin(time) * 0.2})`) // Blue-500
      gradient1.addColorStop(0.3, `rgba(37, 99, 235, ${0.3 + Math.cos(time * 0.8) * 0.1})`) // Blue-600
      gradient1.addColorStop(0.6, `rgba(29, 78, 216, ${0.2 + Math.sin(time * 1.2) * 0.1})`) // Blue-700
      gradient1.addColorStop(1, "rgba(30, 58, 138, 0.1)") // Blue-900

      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gradient2 = ctx.createRadialGradient(
        canvas.width / 3 + Math.cos(time * 0.5) * 250,
        canvas.height / 3 + Math.sin(time * 0.9) * 180,
        0,
        canvas.width / 3,
        canvas.height / 3,
        Math.max(canvas.width, canvas.height) * 0.4,
      )

      gradient2.addColorStop(0, `rgba(147, 197, 253, ${0.3 + Math.cos(time * 1.1) * 0.15})`) // Blue-300
      gradient2.addColorStop(0.5, `rgba(59, 130, 246, ${0.2 + Math.sin(time * 0.6) * 0.1})`) // Blue-500
      gradient2.addColorStop(1, "rgba(29, 78, 216, 0.05)") // Blue-700

      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 80; i++) {
        const x = (Math.sin(time * 0.5 + i * 0.1) * canvas.width) / 3 + canvas.width / 2
        const y = (Math.cos(time * 0.7 + i * 0.15) * canvas.height) / 3 + canvas.height / 2
        const size = Math.sin(time + i) * 3 + 2
        const opacity = 0.1 + Math.sin(time * 0.8 + i) * 0.1

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 197, 253, ${opacity})` // Blue-300
        ctx.fill()
      }

      ctx.beginPath()
      ctx.moveTo(0, canvas.height / 2)
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height / 2 + Math.sin((x + time * 100) * 0.01) * 50
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 + Math.sin(time) * 0.1})`
      ctx.lineWidth = 2
      ctx.stroke()

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
