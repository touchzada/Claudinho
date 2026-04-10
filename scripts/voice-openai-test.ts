import { startRecording, stopRecording } from '../src/services/voice.js'
import { pcm16leToWav } from '../src/utils/wav.js'

const SAMPLE_RATE = 16000
const CHANNELS = 1

type ParsedArgs = {
  seconds: number
  language?: string
}

function parseArgs(argv: string[]): ParsedArgs {
  let seconds = 8
  let language: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--seconds' && argv[i + 1]) {
      const n = Number(argv[i + 1])
      if (Number.isFinite(n) && n > 0) seconds = n
      i++
      continue
    }
    if (a === '--language' && argv[i + 1]) {
      language = argv[i + 1]
      i++
      continue
    }
  }

  return { seconds, language }
}

function estimateUsdBySeconds(seconds: number): number {
  // gpt-4o-mini-transcribe ~ $0.003/min
  return (seconds / 60) * 0.003
}

async function transcribeWithOpenAI(
  wavBuffer: Buffer,
  apiKey: string,
  language?: string,
): Promise<string> {
  const file = new File([wavBuffer], 'audio.wav', { type: 'audio/wav' })
  const form = new FormData()
  form.append('file', file)
  form.append('model', 'gpt-4o-mini-transcribe')
  if (language) form.append('language', language)

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI transcription failed (${response.status}): ${text}`)
  }

  const data = (await response.json()) as { text?: string }
  return data.text?.trim() ?? ''
}

async function main(): Promise<void> {
  const { seconds, language } = parseArgs(process.argv.slice(2))
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY nao encontrado. Defina a variavel e rode de novo.',
    )
  }

  const chunks: Buffer[] = []

  console.log(`🎙 Gravando por ${seconds}s... fale agora.`)
  const started = await startRecording(
    chunk => chunks.push(Buffer.from(chunk)),
    () => {},
    { silenceDetection: false },
  )

  if (!started) {
    throw new Error(
      'Nao foi possivel iniciar gravacao. Verifique permissao de microfone/audio.',
    )
  }

  await new Promise<void>(resolve => setTimeout(resolve, seconds * 1000))
  stopRecording()

  const rawPcm = Buffer.concat(chunks)
  if (rawPcm.length === 0) {
    throw new Error('Nenhum audio capturado. Tente novamente e fale mais alto.')
  }

  const wav = pcm16leToWav(rawPcm, SAMPLE_RATE, CHANNELS)
  const transcript = await transcribeWithOpenAI(wav, apiKey, language)

  const estimated = estimateUsdBySeconds(seconds)
  console.log('\n📝 Transcricao:')
  console.log(transcript || '(vazio)')
  console.log(`\n💸 Custo estimado STT: ~$${estimated.toFixed(5)} USD`)
}

void main().catch(err => {
  console.error(`\n❌ ${err instanceof Error ? err.message : String(err)}`)
  process.exitCode = 1
})
