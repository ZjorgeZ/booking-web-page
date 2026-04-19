import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Shield, Star } from "lucide-react"

export function Hero() {
  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-8 border border-accent/20">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-foreground">Sistema de reservas online</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6 text-balance">
            Reserva tu cita de forma
            <span className="block text-primary">rapida y sencilla</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            Gestiona tus citas en segundos. Elige el servicio que necesitas, 
            selecciona el profesional y la hora que mejor te convenga.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6">
              <Link href="#reservar">
                Reservar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
              <Link href="#como-funciona">
                Ver como funciona
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">24/7</span>
              <span className="text-muted-foreground text-sm mt-1">Disponibilidad</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">+500</span>
              <span className="text-muted-foreground text-sm mt-1">Clientes satisfechos</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">100%</span>
              <span className="text-muted-foreground text-sm mt-1">Reservas seguras</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
