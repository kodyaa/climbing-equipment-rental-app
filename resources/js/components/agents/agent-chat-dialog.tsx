"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BotIcon,
  SendHorizontalIcon,
  Trash2Icon,
  SparklesIcon,
  PlusIcon,
  MessageSquareIcon,
} from "lucide-react"
import { usePage } from "@inertiajs/react"
import { useAgentChat } from "@/hooks/use-agent-chat"
import { MessageBubble, ReasoningSteps, TypingIndicator } from "./chat-components"
import { AI_QUICK_PROMPTS, AiChatSession } from "@/types/ai"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: number
  name: string
  avatar?: string | null
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentChatDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  const { auth } = usePage<{ auth?: { user?: AuthUser } }>().props
  const user = auth?.user

  const {
    sessions,
    activeSessionId,
    messages,
    input,
    isLoading,
    reasoningSteps,
    scrollRef,
    setInput,
    setActiveSessionId,
    handleSend,
    handleRetry,
    handleNewSession,
    handleDeleteSession,
  } = useAgentChat({ userId: user?.id })

  const lastUserMsgIndex =
    [...messages].map((m, i) => (m.role === "user" ? i : -1)).filter((i) => i >= 0).at(-1) ?? -1

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleRetryFromMessage = async (text: string) => {
    if (!text) {
      // Error assistant bubble — re-send the last user message
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
      if (lastUserMsg) await handleRetry(lastUserMsg.content)
    } else {
      await handleRetry(text)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/20 hover:border-primary bg-primary/5 text-foreground hover:bg-primary/10 transition-all cursor-pointer"
        >
          <SparklesIcon className="size-4 text-violet-500 animate-pulse" />
          <span>Tanya AI</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl h-162.5 flex flex-col p-0 overflow-hidden bg-background">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 h-full divide-x divide-border">

          {/* ── Left Pane: Session History ── */}
          <SessionSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
          />

          {/* ── Right Pane: Active Chat ── */}
          <div className="flex flex-col h-162.5 overflow-hidden col-span-1 md:col-span-2">
            <ChatHeader onNewSession={handleNewSession} />

            {/* Message log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  msg={msg}
                  isLastUserMessage={index === lastUserMsgIndex}
                  isCopied={copiedIndex === index}
                  onCopy={() => handleCopy(msg.content, index)}
                  onRetry={handleRetryFromMessage}
                  onSuggestion={handleSend}
                  userAvatarUrl={user?.avatar}
                  userName={user?.name}
                />
              ))}

              {isLoading && reasoningSteps.length > 0 && (
                <ReasoningSteps steps={reasoningSteps} isLoading={isLoading} />
              )}

              {isLoading && reasoningSteps.length === 0 && <TypingIndicator />}

              <div ref={scrollRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && !isLoading && (
              <QuickPrompts onSelect={handleSend} />
            )}

            {/* Input footer */}
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSend(input)}
              isLoading={isLoading}
            />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Session Sidebar ──────────────────────────────────────────────────────────

interface SessionSidebarProps {
  sessions: AiChatSession[]
  activeSessionId: string
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string, e: React.MouseEvent) => void
}

function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionSidebarProps) {
  return (
    <div className="hidden md:flex flex-col bg-muted/10 h-full overflow-hidden col-span-1">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
          <MessageSquareIcon className="size-4 text-violet-500" />
          <span>Riwayat Obrolan</span>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSession}
          className="size-8 rounded-lg hover:bg-muted text-violet-600 hover:text-violet-700"
          title="Buat Obrolan Baru"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group flex items-center justify-between p-3 rounded-lg text-sm cursor-pointer transition-all ${
              session.id === activeSessionId
                ? "bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 font-medium"
                : "hover:bg-muted/50 border border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex flex-col truncate pr-2">
              <span className="truncate">{session.title}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{session.createdAt}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onDeleteSession(session.id, e)}
              className="size-7 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-md transition-opacity"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chat Header ──────────────────────────────────────────────────────────────

function ChatHeader({ onNewSession }: { onNewSession: () => void }) {
  return (
    <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-violet-500/5 text-violet-500">
          <BotIcon className="size-5" />
        </div>
        <div>
          <DialogTitle className="text-base font-semibold leading-none">
            Asisten AI SummitRent
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            Asisten operasional untuk kasir &amp; owner
          </DialogDescription>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSession}
          className="size-8 text-violet-600 hover:bg-muted"
          title="Obrolan Baru"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
    </DialogHeader>
  )
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

function QuickPrompts({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="px-4 pb-3">
      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        <SparklesIcon className="size-3.5 text-violet-500 animate-pulse" />
        <span>Rekomendasi Pertanyaan:</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {AI_QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(prompt)}
            className="text-xs text-left px-3 py-2 rounded-lg bg-muted hover:bg-violet-500/10 hover:text-violet-600 border border-transparent hover:border-violet-500/20 transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Chat Input ───────────────────────────────────────────────────────────────

interface ChatInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  isLoading: boolean
}

function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="p-4 border-t bg-muted/20">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex gap-2"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ketik pesan di sini..."
          disabled={isLoading}
          className="flex-1 bg-background"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || isLoading}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer transition-colors"
        >
          <SendHorizontalIcon className="size-4" />
          <span className="sr-only">Kirim</span>
        </Button>
      </form>
    </div>
  )
}
