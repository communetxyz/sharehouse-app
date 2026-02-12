"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTaskData } from "@/hooks/use-task-data"
import { useCommuneData } from "@/hooks/use-commune-data"
import { useWallet } from "@/hooks/use-wallet"

interface ChatMessage {
  id: string
  role: "user" | "bot"
  content: string
  timestamp: number
}

const HELP_TEXT = `Available commands:
• /help — Show this help
• /list tasks — List all tasks
• /list my tasks — List your tasks
• /list chores — List your chores
• /status — Show sharehouse status
• /members — List members`

function processCommand(
  input: string,
  tasks: any[],
  chores: any[],
  members: any[],
  commune: any,
  address?: string
): string {
  const cmd = input.trim().toLowerCase()

  if (cmd === "/help") return HELP_TEXT

  if (cmd === "/list tasks" || cmd === "/tasks") {
    if (tasks.length === 0) return "No tasks found."
    const pending = tasks.filter((t) => !t.done && !t.disputed)
    const done = tasks.filter((t) => t.done)
    return `📋 Tasks (${tasks.length} total):\n\n` +
      `Pending (${pending.length}):\n` +
      (pending.length === 0 ? "  None\n" : pending.map((t) => `  • ${t.description} → ${t.assignedToUsername || t.assignedTo.slice(0, 8)}...`).join("\n") + "\n") +
      `\nDone (${done.length}):\n` +
      (done.length === 0 ? "  None" : done.map((t) => `  ✅ ${t.description}`).join("\n"))
  }

  if (cmd === "/list my tasks" || cmd === "/my tasks") {
    const myTasks = tasks.filter((t) => t.isAssignedToUser && !t.done)
    if (myTasks.length === 0) return "🎉 No pending tasks assigned to you!"
    return `Your pending tasks (${myTasks.length}):\n` +
      myTasks.map((t) => `  • ${t.description} — due ${new Date(t.dueDate * 1000).toLocaleDateString()}`).join("\n")
  }

  if (cmd === "/list chores" || cmd === "/chores" || cmd === "/my chores") {
    const myChores = chores.filter((c) => c.isAssignedToUser && !c.completed)
    if (myChores.length === 0) return "🎉 No pending chores assigned to you!"
    return `Your pending chores (${myChores.length}):\n` +
      myChores.map((c) => `  • ${c.title}`).join("\n")
  }

  if (cmd === "/status") {
    return `🏠 ${commune?.name || "ShareHouse"}\n` +
      `Members: ${members.length}\n` +
      `Pending tasks: ${tasks.filter((t) => !t.done && !t.disputed).length}\n` +
      `Pending chores: ${chores.filter((c) => c.isAssignedToUser && !c.completed).length}\n` +
      `Disputed tasks: ${tasks.filter((t) => t.disputed).length}`
  }

  if (cmd === "/members") {
    if (members.length === 0) return "No members found."
    return `👥 Members (${members.length}):\n` +
      members.map((m) => `  • ${m.username || m.address.slice(0, 10)}...${m.isCurrentUser ? " (you)" : ""}`).join("\n")
  }

  if (cmd.startsWith("/")) {
    return `Unknown command: ${cmd.split(" ")[0]}\nType /help to see available commands.`
  }

  return `I understand commands starting with /. Type /help to see what I can do!`
}

export function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      content: "👋 Hi! I'm the ShareHouse bot. Type /help to see available commands.",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { tasks } = useTaskData()
  const { commune, members, chores } = useCommuneData()
  const { address } = useWallet()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    const response = processCommand(input, tasks, chores, members, commune, address)
    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}-bot`,
      role: "bot",
      content: response,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput("")
  }

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-sage hover:bg-sage/90 text-cream shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="border-charcoal/10 shadow-xl">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-serif flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sage" />
                  ShareHouse Bot
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div ref={scrollRef} className="h-72 overflow-y-auto px-4 py-2 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "bot" ? "bg-sage/20" : "bg-charcoal/10"
                        }`}
                      >
                        {msg.role === "bot" ? (
                          <Bot className="w-3 h-3 text-sage" />
                        ) : (
                          <User className="w-3 h-3 text-charcoal/60" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                          msg.role === "bot"
                            ? "bg-sage/10 text-charcoal"
                            : "bg-charcoal/5 text-charcoal"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t border-charcoal/10 p-3 flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type /help to start..."
                    className="text-sm"
                  />
                  <Button onClick={handleSend} size="sm" className="bg-sage hover:bg-sage/90 text-cream">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
