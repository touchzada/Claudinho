'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe, Zap, History, Shield, Terminal, Code } from 'lucide-react'

export default function Home() {
  const [terminalText, setTerminalText] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)

  const terminalLines = [
    '$ claudinho --ajuda',
    '',
    'Claudinho v0.1.8 - Terminal de IA em português',
    '',
    'Comandos disponíveis:',
    '  start          Inicia o Claudinho',
    '  config         Abre configurações',
    '  history        Histórico de conversas (Ctrl+H)',
    '  provider       Escolhe provedor de IA',
    '',
    'Provedores suportados:',
    '  • OpenAI (GPT-4, GPT-3.5)',
    '  • Ollama (local, grátis)',
    '  • DeepSeek (chinês, barato)',
    '  • Gemini, Groq, OpenRouter...',
    '',
    'Bora codar? 🚀'
  ]

  useEffect(() => {
    let currentLine = 0
    let currentChar = 0

    const interval = setInterval(() => {
      if (currentLine < terminalLines.length) {
        const line = terminalLines[currentLine]
        if (currentChar <= line.length) {
          const text = terminalLines
            .slice(0, currentLine)
            .join('\n') + '\n' + line.slice(0, currentChar)
          setTerminalText(text)
          currentChar++
        } else {
          currentLine++
          currentChar = 0
        }
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">

      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-slate-800/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <span className="font-mono text-xl font-bold">Claudinho</span>
            <span className="text-xs px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded-full font-mono">
              v0.1.8
            </span>
          </div>
          <nav className="hidden md:flex gap-6 font-mono text-sm">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#providers" className="hover:text-emerald-400 transition-colors">Provedores</a>
            <a href="https://github.com/touchzada/Claudinho" className="hover:text-emerald-400 transition-colors">GitHub</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tight">
            Terminal de IA
            <br />
            <span className="text-emerald-400">em português</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Fork brasileiro do Claude Code. Sem telemetria, sem firula. Só você, o terminal e a IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a
              href="https://github.com/touchzada/Claudinho"
              className="px-8 py-3 bg-emerald-400 text-black font-mono font-bold rounded hover:bg-emerald-300 transition-colors"
            >
              Baixar agora
            </a>
            <a
              href="#features"
              className="px-8 py-3 border border-slate-700 font-mono rounded hover:border-emerald-400 hover:text-emerald-400 transition-colors"
            >
              Ver features
            </a>
          </div>
        </div>
      </section>

      {/* Terminal Demo */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden backdrop-blur-sm">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-slate-500 font-mono ml-4">claudinho@terminal</span>
            </div>
            {/* Terminal content */}
            <div ref={terminalRef} className="p-6 font-mono text-sm min-h-[400px]">
              <pre className="text-emerald-400 whitespace-pre-wrap">{terminalText}</pre>
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold font-mono text-center mb-16">
          Bora codar?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {[
            {
              icon: Globe,
              color: 'text-blue-400',
              title: 'Multi-provedor',
              desc: 'OpenAI, Ollama, DeepSeek, Gemini, Groq... Escolhe o teu'
            },
            {
              icon: Zap,
              color: 'text-yellow-400',
              title: 'Rápido pra caralho',
              desc: 'Terminal nativo, sem web, sem delay. É só tu e o código'
            },
            {
              icon: History,
              color: 'text-purple-400',
              title: 'Histórico de conversas',
              desc: 'Ctrl+H e volta pra qualquer conversa antiga. Simples assim'
            },
            {
              icon: Shield,
              color: 'text-green-400',
              title: 'Zero telemetria',
              desc: 'Teus dados ficam contigo. Sem tracking, sem analytics, sem nada'
            },
            {
              icon: Terminal,
              color: 'text-cyan-400',
              title: '100% português',
              desc: 'Interface, mensagens, tudo em PT-BR. Feito por BR pra BR'
            },
            {
              icon: Code,
              color: 'text-pink-400',
              title: 'abrir source',
              desc: 'Código aberto no GitHub. Contribui, forka, faz o que quiser'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-slate-900/30 border border-slate-800 rounded-lg hover:border-emerald-400/50 transition-colors group"
            >
              <feature.icon className={`w-8 h-8 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="font-mono font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Providers */}
      <section id="providers" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold font-mono text-center mb-8">
          Escolhe teu provedor
        </h2>
        <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
          Claudinho funciona com vários provedores de IA. Usa o que tu já tem ou testa um novo.
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          <details className="group bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden hover:border-emerald-400/50 transition-colors">
            <summary className="px-6 py-4 cursor-pointer font-mono flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <span className="font-bold">OpenAI</span>
                <span className="text-xs text-slate-500">GPT-4, GPT-3.5</span>
              </span>
              <span className="text-emerald-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-6 pb-4 text-sm text-slate-400 border-t border-slate-800 pt-4">
              <p>O clássico. GPT-4 é top mas é pago. GPT-3.5 é mais barato e já resolve muito.</p>
              <code className="block mt-2 p-2 bg-black/50 rounded text-emerald-400">
                claudinho provider openai
              </code>
            </div>
          </details>

          <details className="group bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden hover:border-emerald-400/50 transition-colors">
            <summary className="px-6 py-4 cursor-pointer font-mono flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="text-2xl">🦙</span>
                <span className="font-bold">Ollama</span>
                <span className="text-xs text-slate-500">Local, grátis</span>
              </span>
              <span className="text-emerald-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-6 pb-4 text-sm text-slate-400 border-t border-slate-800 pt-4">
              <p>Roda na tua máquina. 100% grátis, 100% privado. Llama, Mistral, CodeLlama...</p>
              <code className="block mt-2 p-2 bg-black/50 rounded text-emerald-400">
                claudinho provider ollama
              </code>
            </div>
          </details>

          <details className="group bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden hover:border-emerald-400/50 transition-colors">
            <summary className="px-6 py-4 cursor-pointer font-mono flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="text-2xl">🔮</span>
                <span className="font-bold">DeepSeek</span>
                <span className="text-xs text-slate-500">Chinês, barato, bom</span>
              </span>
              <span className="text-emerald-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-6 pb-4 text-sm text-slate-400 border-t border-slate-800 pt-4">
              <p>Modelo chinês que tá bombando. Barato pra caralho e performa bem.</p>
              <code className="block mt-2 p-2 bg-black/50 rounded text-emerald-400">
                claudinho provider deepseek
              </code>
            </div>
          </details>
        </div>
      </section>


      {/* Stats */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold font-mono text-emerald-400 mb-2">200+</div>
            <div className="text-slate-400">Modelos suportados</div>
          </div>
          <div>
            <div className="text-5xl font-bold font-mono text-emerald-400 mb-2">100%</div>
            <div className="text-slate-400">Grátis e open source</div>
          </div>
          <div>
            <div className="text-5xl font-bold font-mono text-emerald-400 mb-2">0</div>
            <div className="text-slate-400">Telemetria ou tracking</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p className="font-mono">
            Feito com ❤️ e ☕ por devs brasileiros
          </p>
          <p className="mt-2">
            <a href="https://github.com/touchzada/Claudinho" className="hover:text-emerald-400 transition-colors">
              GitHub
            </a>
            {' • '}
            Fork do Claude Code (sem telemetria)
          </p>
        </div>
      </footer>
    </div>
  )
}
