"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rotation: number; color: string }[]>([])

  useEffect(() => {
    if (active) {
      const colors = ["#8B7355", "#A8C5A0", "#F5EDE0", "#D4AF37", "#FFD700"]
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        if (onComplete) onComplete()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute top-1/2 left-1/2"
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 1,
              x: particle.x,
              y: particle.y,
              rotate: particle.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
