import { BookingForm } from "@/components/booking/booking-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">BookingApp</h1>
            <p className="text-sm text-muted-foreground">Sistema de reservas online</p>
          </div>
          <a
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Panel Admin
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Reserva tu cita</h2>
          <p className="text-muted-foreground">
            Selecciona el servicio, fecha y hora que mejor te convenga
          </p>
        </div>

        <BookingForm />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>BookingApp - Sistema de reservas online</p>
        </div>
      </footer>
    </div>
  )
}
