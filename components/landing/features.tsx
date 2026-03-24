import { Zap, MessageCircle, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Check every minute',
    description: 'No esperes 5 minutos para saber que caíste. Te chequeamos cada 60 segundos.',
  },
  {
    icon: MessageCircle,
    title: 'Telegram alerts',
    description: 'Recibe un mensaje en segundos, no en horas. Alertas directas a tu chat.',
  },
  {
    icon: BarChart3,
    title: 'Incident history',
    description: 'Revisa cuándo y por qué cayó tu servicio. Historial completo con status codes.',
  },
  {
    icon: Shield,
    title: 'Multi-tenant',
    description: 'Cada equipo gestiona sus propios monitores. Aislamiento total de datos.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why PingRanger</h2>
        <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
          Todo lo que necesitas para saber que tus servicios están vivos.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-bg-card border border-border-subtle rounded-xl p-6 hover:border-border-active transition-all duration-200"
            >
              <f.icon className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
