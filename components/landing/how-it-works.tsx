import { Link2, MessageSquare, Bell } from 'lucide-react'

const steps = [
  {
    icon: Link2,
    number: '01',
    title: 'Agrega tu URL',
    description: 'Ingresa la URL y elige el intervalo de chequeo. Listo en 10 segundos.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Configura Telegram',
    description: 'Pega tu Chat ID y listo. Sin bots complicados, sin configuraciones extra.',
  },
  {
    icon: Bell,
    number: '03',
    title: 'Recibe alertas',
    description: 'Te avisamos al instante si algo falla. Y cuando se recupera también.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">3 pasos y listo</h2>
        <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
          Empieza a monitorear en menos de un minuto.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border-subtle" />
              )}
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
                <s.icon className="h-8 w-8 text-accent" />
              </div>
              <div className="text-xs font-mono text-accent mb-2">{s.number}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
