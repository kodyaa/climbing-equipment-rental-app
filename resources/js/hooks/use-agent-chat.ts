import * as React from "react"
import { useEcho } from "@laravel/echo-react"
import {
  AiChatSession,
  AiMessage,
  createAiSession,
  loadAiSessions,
  saveAiSessions,
} from "@/types/ai"

interface UseAgentChatOptions {
  userId: number | undefined
}

interface UseAgentChatReturn {
  sessions: AiChatSession[]
  activeSessionId: string
  messages: AiMessage[]
  input: string
  isLoading: boolean
  reasoningSteps: string[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  setInput: (v: string) => void
  setActiveSessionId: (id: string) => void
  handleSend: (text: string) => Promise<void>
  handleRetry: (text: string) => Promise<void>
  handleNewSession: () => void
  handleDeleteSession: (id: string, e: React.MouseEvent) => void
}

export function useAgentChat({ userId }: UseAgentChatOptions): UseAgentChatReturn {
  const [sessions, setSessions] = React.useState<AiChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = React.useState<string>("")
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [reasoningSteps, setReasoningSteps] = React.useState<string[]>([])
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  // Refs to avoid stale closures inside Echo callback without triggering re-subscription
  const activeSessionIdRef = React.useRef(activeSessionId)
  React.useEffect(() => { activeSessionIdRef.current = activeSessionId }, [activeSessionId])

  // Track the current pending requestId — only process Echo events that match
  const pendingRequestIdRef = React.useRef<string | null>(null)

  // Guard against duplicate "completed" processing (React StrictMode double-invoke)
  const completedRequestIds = React.useRef<Set<string>>(new Set())

  // Load sessions on mount
  React.useEffect(() => {
    const loaded = loadAiSessions()
    setSessions(loaded)
    setActiveSessionId(loaded[0].id)
  }, [])

  // Auto-scroll on new messages / reasoning
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, reasoningSteps, isLoading])

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession?.messages ?? []

  /**
   * Stable append — reads sessionId from ref at call-time so it never goes stale
   * even without being listed in Echo's dependency array.
   */
  const appendMessageStable = React.useCallback((newMsg: AiMessage) => {
    setSessions((prev) => {
      const sessionId = activeSessionIdRef.current
      const updated = prev.map((session) =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, newMsg] }
          : session
      )
      saveAiSessions(updated)
      return updated
    })
  }, []) // intentionally no deps — reads refs at runtime

  // Real-time Echo listener
  // Only depends on [userId] to prevent re-subscription on every session switch.
  // Deduplication via requestId prevents the double-fire caused by React StrictMode.
  useEcho(
    userId ? `ai-chat.${userId}` : "",
    ".reasoning.updated",
    (e: {
      step: string
      status: "thinking" | "completed" | "error"
      response: string | null
      suggestions?: string[]
      requestId?: string
    }) => {
      // Ignore events that don't belong to the current pending request
      if (e.requestId && pendingRequestIdRef.current && e.requestId !== pendingRequestIdRef.current) {
        return
      }

      if (e.status === "thinking") {
        setReasoningSteps((prev) => (prev.includes(e.step) ? prev : [...prev, e.step]))
        return
      }

      // "completed" or "error" — guard against double-processing
      const dedupeKey = e.requestId ?? `${e.status}-${e.response?.slice(0, 40)}`
      if (completedRequestIds.current.has(dedupeKey)) {
        return // already processed — drop the duplicate
      }
      completedRequestIds.current.add(dedupeKey)
      // Auto-clear after 10 s so memory doesn't grow indefinitely
      setTimeout(() => completedRequestIds.current.delete(dedupeKey), 10_000)

      setReasoningSteps([])
      setIsLoading(false)
      pendingRequestIdRef.current = null

      if (e.response) {
        appendMessageStable({
          role: "assistant",
          content: e.response,
          isError: e.status === "error",
          suggestions: e.suggestions ?? [],
        })
      }
    },
    [userId] // ← do NOT add activeSessionId here
  )

  /** Post the message to the server */
  async function dispatchToServer(requestId: string, text: string, history: AiMessage[]) {
    const csrfToken =
      document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? ""
    const response = await fetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
      body: JSON.stringify({
        requestId,
        message: text,
        history: history.map(({ role, content }) => ({ role, content })),
      }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.response ?? "Terjadi kesalahan sistem.")
    }
  }

  /** Core send — snapshot prevents stale closure issues */
  async function sendWithHistory(text: string, snapshot: AiMessage[]) {
    const requestId = crypto.randomUUID()
    pendingRequestIdRef.current = requestId

    setInput("")
    setReasoningSteps(["Menerima input Anda..."])
    setIsLoading(true)

    try {
      await dispatchToServer(requestId, text, snapshot.slice(0, -1))
    } catch {
      setIsLoading(false)
      setReasoningSteps([])
      pendingRequestIdRef.current = null
      appendMessageStable({
        role: "assistant",
        content:
          "Koneksi ke asisten AI terputus. Pastikan server Ollama dengan model qwen2.5:3b Anda aktif.",
        isError: true,
      })
    }
  }

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading || !activeSessionId) return

    const userMessage: AiMessage = { role: "user", content: textToSend }
    let updatedMessages: AiMessage[] = []

    setSessions((prev) => {
      const updated = prev.map((session) => {
        if (session.id !== activeSessionId) return session
        const title =
          session.messages.length <= 1
            ? textToSend.length > 22
              ? `${textToSend.slice(0, 22)}...`
              : textToSend
            : session.title
        updatedMessages = [...session.messages, userMessage]
        return { ...session, title, messages: updatedMessages }
      })
      saveAiSessions(updated)
      return updated
    })

    await sendWithHistory(textToSend, updatedMessages)
  }

  const handleRetry = async (text: string) => {
    if (isLoading) return
    setSessions((prev) => {
      const updated = prev.map((session) => {
        if (session.id !== activeSessionId) return session
        const msgs = [...session.messages]
        if (msgs.at(-1)?.isError) msgs.pop()
        return { ...session, messages: msgs }
      })
      saveAiSessions(updated)
      return updated
    })
    const cleanMessages = messages.filter((m) => !m.isError)
    const userMessage: AiMessage = { role: "user", content: text }
    await sendWithHistory(text, [...cleanMessages, userMessage])
  }

  const handleNewSession = () => {
    const session = createAiSession()
    setSessions((prev) => {
      const updated = [session, ...prev]
      saveAiSessions(updated)
      return updated
    })
    setActiveSessionId(session.id)
  }

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      let activeId = activeSessionId

      if (activeSessionId === id) {
        if (updated.length === 0) {
          const fallback = createAiSession()
          updated.push(fallback)
        }
        activeId = updated[0].id
        setActiveSessionId(activeId)
      }

      saveAiSessions(updated)
      return updated
    })
  }

  return {
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
  }
}
