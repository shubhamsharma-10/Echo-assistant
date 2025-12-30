import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const API_URL = 'http://localhost:3000/api/chat'

interface Message {
  id: number
  role: 'user' | 'bot'
  content: string
  metrics?: {
    helpfulness: number
    safety: number
    hallucinationRisk: number
  }
  latency?: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { id: Date.now(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'web-user', question: input })
      })
      const data = await response.json()
      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.answer,
        metrics: data.metrics,
        latency: data.latency
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getScoreClass = (score: number, inverse = false) => {
    if (inverse) {
      if (score > 0.5) return 'bg-red-500/20 text-red-300 border-red-500/30'
      if (score > 0.3) return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    }
    if (score >= 0.8) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    if (score >= 0.6) return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    return 'bg-red-500/20 text-red-300 border-red-500/30'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Powered by Gemini</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            TechGadget AI Support
          </h1>
          <p className="text-gray-500 text-sm mt-1">Quality-Monitored • Real-Time Observability</p>
        </div>

        {/* Chat Container */}
        <div className="w-full max-w-2xl">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl mb-4">
                    🤖
                  </div>
                  <h2 className="text-white text-lg font-medium mb-1">How can I help you?</h2>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Ask about orders, returns, billing, or technical support
                  </p>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-6 justify-center">
                    {['Where is my order?', 'Request refund', 'Technical issue'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="px-3 py-1.5 text-xs text-gray-400 border border-white/10 rounded-full hover:bg-white/5 hover:border-white/20 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    <div
                      className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-200'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>

                    {/* Metrics Badge */}
                    {msg.metrics && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getScoreClass(msg.metrics.helpfulness)}`}>
                          Helpful {(msg.metrics.helpfulness * 100).toFixed(0)}%
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getScoreClass(msg.metrics.safety)}`}>
                          Safe {(msg.metrics.safety * 100).toFixed(0)}%
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getScoreClass(msg.metrics.hallucinationRisk, true)}`}>
                          Risk {(msg.metrics.hallucinationRisk * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-gray-500 border border-white/10">
                          {msg.latency}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4 bg-black/20">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl px-6"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-xs">
              Monitored by <span className="text-purple-400">Datadog</span> • Built with <span className="text-blue-400">Gemini AI</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
