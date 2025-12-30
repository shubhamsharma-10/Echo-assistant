import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// API endpoint
const API_URL = 'http://localhost:3000/api/chat'

// Message type
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Send message to API
  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input
    }

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

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Get score color
  const getScoreColor = (score: number, inverse = false) => {
    if (inverse) {
      if (score > 0.5) return 'text-red-400'
      if (score > 0.3) return 'text-yellow-400'
      return 'text-green-400'
    }
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col bg-slate-800 border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h1 className="text-white font-semibold">TechGadget Support</h1>
              <p className="text-slate-400 text-sm">AI-Powered Customer Support</p>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-20">
              <p className="text-lg mb-2">Welcome to TechGadget Support</p>
              <p className="text-sm">Ask me about orders, returns, or technical issues.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
            >
              <div
                className={`inline-block max-w-[85%] p-3 rounded-lg ${msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                  }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Quality Metrics */}
              {msg.metrics && (
                <div className="mt-1 flex gap-3 text-xs">
                  <span className={getScoreColor(msg.metrics.helpfulness)}>
                    Helpful: {(msg.metrics.helpfulness * 100).toFixed(0)}%
                  </span>
                  <span className={getScoreColor(msg.metrics.safety)}>
                    Safe: {(msg.metrics.safety * 100).toFixed(0)}%
                  </span>
                  <span className={getScoreColor(msg.metrics.hallucinationRisk, true)}>
                    Risk: {(msg.metrics.hallucinationRisk * 100).toFixed(0)}%
                  </span>
                  <span className="text-slate-500">
                    {msg.latency}ms
                  </span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mb-4">
              <div className="inline-block bg-slate-700 text-slate-100 p-3 rounded-lg">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700 shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default App
