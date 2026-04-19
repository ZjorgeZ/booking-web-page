"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl text-foreground">BookingApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#servicios" className="text-muted-foreground hover:text-foreground transition-colors">
              Servicios
            </Link>
            <Link href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </Link>
            <Link href="#testimonios" className="text-muted-foreground hover:text-foreground transition-colors">
              Testimonios
            </Link>
            <Link href="#contacto" className="text-muted-foreground hover:text-foreground transition-colors">
              Contacto
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Panel Admin
            </Link>
            <Button asChild>
              <Link href="#reservar">Reservar Ahora</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="#servicios"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="#como-funciona"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Como Funciona
              </Link>
              <Link
                href="#testimonios"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonios
              </Link>
              <Link
                href="#contacto"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Panel Admin
              </Link>
              <Button asChild className="w-full mt-2">
                <Link href="#reservar">Reservar Ahora</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
