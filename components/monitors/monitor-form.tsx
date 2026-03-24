'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { ChevronDown, ChevronUp, Globe, Copy, Check } from 'lucide-react'
import { createApiClient, MonitorDetail } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  url: z.string().url('Ingresa una URL válida'),
  intervalMin: z.number().int().min(1).max(60),
  active: z.boolean(),
  alertType: z.enum(['telegram', 'discord', 'slack', 'none']),
  chatId: z.string().optional(),
  webhookUrl: z.string().optional(),
}).refine(
  (data) => {
    if (data.alertType === 'telegram') return !!data.chatId && data.chatId.length > 0
    return true
  },
  {
    message: 'El Chat ID es requerido para alertas de Telegram',
    path: ['chatId'],
  },
).refine(
  (data) => {
    if (data.alertType === 'discord' || data.alertType === 'slack') return !!data.webhookUrl && data.webhookUrl.length > 0
    return true
  },
  {
    message: 'La Webhook URL es requerida',
    path: ['webhookUrl'],
  },
)

type FormValues = z.infer<typeof schema>

interface MonitorFormProps {
  monitor?: MonitorDetail
}

function getAlertType(monitor?: MonitorDetail): 'telegram' | 'discord' | 'slack' | 'none' {
  if (!monitor?.alertConfig) return 'none'
  return monitor.alertConfig.type as 'telegram' | 'discord' | 'slack'
}

export function MonitorForm({ monitor }: MonitorFormProps) {
  const { getToken } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { mutate } = useSWRConfig()
  const [alertOpen, setAlertOpen] = useState(!!monitor?.alertConfig)
  const [isPublic, setIsPublic] = useState(!!monitor?.publicSlug)
  const [copied, setCopied] = useState(false)

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${monitor?.publicSlug}`
    : ''

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: monitor?.name ?? '',
      url: monitor?.url ?? '',
      intervalMin: monitor?.intervalMin ?? 5,
      active: monitor?.active ?? true,
      alertType: getAlertType(monitor),
      chatId: monitor?.alertConfig?.config?.chatId ?? '',
      webhookUrl: (monitor?.alertConfig?.config as Record<string, string>)?.webhookUrl ?? '',
    },
  })

  const active = watch('active')
  const alertType = watch('alertType')

  async function onSubmit(data: FormValues) {
    try {
      const token = await getToken()
      const api = createApiClient(token)

      const alertConfig =
        data.alertType === 'telegram' && data.chatId
          ? { type: 'telegram' as const, chatId: data.chatId }
          : data.alertType === 'discord' && data.webhookUrl
            ? { type: 'discord' as const, webhookUrl: data.webhookUrl }
            : data.alertType === 'slack' && data.webhookUrl
              ? { type: 'slack' as const, webhookUrl: data.webhookUrl }
              : undefined

      const payload = {
        name: data.name,
        url: data.url,
        intervalMin: data.intervalMin,
        active: data.active,
        makePublic: isPublic,
        ...(alertConfig ? { alertConfig } : {}),
      }

      if (monitor) {
        await api.updateMonitor(monitor.id, payload)
        toast('Monitor actualizado')
      } else {
        await api.createMonitor(payload)
        toast('Monitor creado')
      }

      await mutate('/monitors')
      await mutate(`/monitors/${monitor?.id}`)
      router.push('/dashboard')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      <Input
        label="Nombre del monitor"
        placeholder="Mi API de producción"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="URL a monitorear"
        placeholder="https://api.miapp.com/health"
        error={errors.url?.message}
        {...register('url')}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Intervalo de chequeo</label>
        <select
          {...register('intervalMin', { valueAsNumber: true })}
          className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:border-accent/50 focus:ring-accent/20 transition-all duration-200"
        >
          <option value={1}>1 minuto</option>
          <option value={5}>5 minutos</option>
          <option value={10}>10 minutos</option>
          <option value={30}>30 minutos</option>
          <option value={60}>60 minutos</option>
        </select>
      </div>

      {/* Toggle active */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">Monitor activo</label>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => setValue('active', !active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            active ? 'bg-accent' : 'bg-bg-elevated border border-border-subtle'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Toggle public */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-text-muted" />
            <label className="text-sm font-medium text-text-primary">Status page pública</label>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublic ? 'bg-accent' : 'bg-bg-elevated border border-border-subtle'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {isPublic && monitor?.publicSlug && (
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg">
            <span className="text-xs text-text-secondary truncate flex-1">{publicUrl}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-status-up" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

        {isPublic && !monitor?.publicSlug && (
          <p className="text-xs text-text-muted">La URL pública se generará al guardar.</p>
        )}
      </div>

      {/* Alert config */}
      <div className="border border-border-subtle rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAlertOpen(!alertOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-white/5 transition-colors"
        >
          Configuración de alertas
          {alertOpen ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
        </button>

        {alertOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Canal de alertas</label>
              <select
                {...register('alertType')}
                className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:border-accent/50 focus:ring-accent/20 transition-all duration-200"
              >
                <option value="none">Sin alertas</option>
                <option value="telegram">Telegram</option>
                <option value="discord">Discord</option>
                <option value="slack">Slack</option>
              </select>
            </div>

            {alertType === 'telegram' && (
              <div className="space-y-3">
                <Input
                  label="Chat ID de Telegram"
                  placeholder="123456789"
                  error={errors.chatId?.message}
                  {...register('chatId')}
                />
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3 space-y-2.5 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary text-sm">¿Cómo obtener tu Chat ID?</p>

                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">Mensaje directo (DM):</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-text-muted">
                      <li>Abre <span className="text-accent">@PingRangerBot</span> en Telegram y envía <code className="bg-white/5 px-1 rounded">/start</code></li>
                      <li>El bot te responderá con tu Chat ID</li>
                      <li>Cópialo y pégalo aquí</li>
                    </ol>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">Grupo:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-text-muted">
                      <li>Agrega <span className="text-accent">@PingRangerBot</span> como miembro del grupo</li>
                      <li>El bot enviará automáticamente el Chat ID del grupo</li>
                      <li>Cópialo y pégalo aquí</li>
                    </ol>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">Canal:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-text-muted">
                      <li>Agrega <span className="text-accent">@PingRangerBot</span> como <strong className="text-text-secondary">administrador</strong> del canal con permiso de publicar</li>
                      <li>El bot enviará automáticamente el Chat ID del canal</li>
                      <li>Cópialo y pégalo aquí</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {alertType === 'discord' && (
              <div className="space-y-3">
                <Input
                  label="Webhook URL de Discord"
                  placeholder="https://discord.com/api/webhooks/..."
                  error={errors.webhookUrl?.message}
                  {...register('webhookUrl')}
                />
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3 space-y-2.5 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary text-sm">¿Cómo crear un Webhook en Discord?</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-text-muted">
                    <li>Abre Discord y ve al canal donde quieres recibir alertas</li>
                    <li>Haz clic en el ícono de engranaje (⚙️) para editar el canal</li>
                    <li>Ve a <strong className="text-text-secondary">Integraciones</strong> → <strong className="text-text-secondary">Webhooks</strong></li>
                    <li>Clic en <strong className="text-text-secondary">Nuevo Webhook</strong>, ponle un nombre (ej: PingRanger)</li>
                    <li>Haz clic en <strong className="text-text-secondary">Copiar URL del Webhook</strong> y pégala aquí</li>
                  </ol>
                </div>
              </div>
            )}

            {alertType === 'slack' && (
              <div className="space-y-3">
                <Input
                  label="Webhook URL de Slack"
                  placeholder="https://hooks.slack.com/services/T.../B.../xxx"
                  error={errors.webhookUrl?.message}
                  {...register('webhookUrl')}
                />
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3 space-y-2.5 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary text-sm">¿Cómo crear un Webhook en Slack?</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-text-muted">
                    <li>Ve a <strong className="text-text-secondary">api.slack.com/apps</strong> y crea una app (o selecciona una existente)</li>
                    <li>En el menú lateral, ve a <strong className="text-text-secondary">Incoming Webhooks</strong></li>
                    <li>Activa el toggle <strong className="text-text-secondary">Activate Incoming Webhooks</strong></li>
                    <li>Haz clic en <strong className="text-text-secondary">Add New Webhook to Workspace</strong></li>
                    <li>Selecciona el canal y haz clic en <strong className="text-text-secondary">Allow</strong></li>
                    <li>Copia la <strong className="text-text-secondary">Webhook URL</strong> y pégala aquí</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {monitor ? 'Guardar cambios' : 'Crear monitor'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
