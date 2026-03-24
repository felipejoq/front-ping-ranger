'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: '¿Con qué frecuencia se revisan mis URLs?',
    answer:
      'El scheduler corre cada minuto y comprueba todos los monitores activos cuyo intervalo ya se cumplió. El intervalo mínimo es 1 minuto; el predeterminado es 5 minutos. Puedes ajustarlo al crear o editar cada monitor.',
  },
  {
    question: '¿Qué canales de alerta están disponibles?',
    answer:
      'PingRanger soporta Telegram, Discord y Slack. Cada monitor puede tener un canal de alerta independiente. Las notificaciones se envían cuando el servicio cae y cuando se recupera.',
  },
  {
    question: '¿Cómo configuro las alertas de Telegram?',
    answer:
      'Necesitas el Chat ID de la conversación con el bot de PingRanger. Inicia una conversación con el bot, escríbele cualquier mensaje y el bot te responderá con tu Chat ID. Luego pégalo en la configuración del monitor.',
  },
  {
    question: '¿Qué pasa cuando mi sitio se recupera?',
    answer:
      'El incidente se cierra automáticamente (se registra la fecha de resolución) y recibes una notificación de recuperación por el canal configurado. El monitor vuelve a mostrar estado "up" en el dashboard.',
  },
  {
    question: '¿Qué tipo de verificación se realiza?',
    answer:
      'Se hace una petición HTTP GET a la URL con un timeout de 10 segundos. Si la respuesta tiene un código de estado menor a 400, el monitor se considera "up". Se registra la latencia en milisegundos para cada check.',
  },
  {
    question: '¿Mis monitores son privados?',
    answer:
      'Sí. Cada monitor está asociado a tu cuenta y solo tú puedes verlos y gestionarlos. PingRanger tiene aislamiento total de datos entre usuarios.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border-subtle last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm text-text-secondary leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">FAQ</h2>
        <p className="text-text-secondary text-center mb-16">
          Preguntas frecuentes sobre PingRanger.
        </p>
        <div className="bg-bg-card border border-border-subtle rounded-xl px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
