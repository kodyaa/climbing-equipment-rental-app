import * as React from "react"
import {
  AiChatSession,
  AiMessage,
  createAiSession,
} from "@/types/ai"

// ─── SSE event shape from /ai/stream ─────────────────────────────────────────

type SseEvent =
  | { type: "step"; step: string }
  | { type: "start" }
  | { type: "chunk"; text: string }
  | { type: "done"; suggestions: string[]; text?: string; conversation_id?: string }
  | { type: "error"; message: string }

// ─── Hook interface ───────────────────────────────────────────────────────────

interface UseAgentChatOptions {
  userId?: number
}

interface UseAgentChatReturn {
  sessions: AiChatSession[]
  activeSessionId: string
  messages: AiMessage[]
  streamingContent: string | null   // null = not streaming; string = current streamed text
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgentChat({ userId }: UseAgentChatOptions = {}): UseAgentChatReturn {
  const [sessions, setSessions] = React.useState<AiChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = React.useState<string>("")
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [reasoningSteps, setReasoningSteps] = React.useState<string[]>([])
  const [streamingContent, setStreamingContent] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  // Refs for stable access inside async callbacks without triggering re-renders
  const activeSessionIdRef = React.useRef(activeSessionId)
  React.useEffect(() => { activeSessionIdRef.current = activeSessionId }, [activeSessionId])

  // Abort controller ref — lets us cancel an in-flight stream on unmount/retry
  const abortControllerRef = React.useRef<AbortController | null>(null)

  // Refs for typewriter buffer smoothing effect
  const accumulatedRef = React.useRef("")
  const displayedRef = React.useRef("")
  const isStreamDoneRef = React.useRef(false)
  const finalSuggestionsRef = React.useRef<string[]>([])
  const finalConvIdRef = React.useRef<string | undefined>(undefined)

  // Load sessions on mount from database
  React.useEffect(() => {
    fetch("/ai/sessions")
      .then((res) => res.json())
      .then((data: { id: string; title: string; createdAt: string }[]) => {
        if (data.length > 0) {
          const mapped = data.map((s) => ({
            id: s.id,
            title: s.title,
            createdAt: s.createdAt,
            messages: [],
          }))
          setSessions(mapped)
          setActiveSessionId(mapped[0].id)
        } else {
          const fallback = createAiSession(`temp-${Date.now()}`)
          setSessions([fallback])
          setActiveSessionId(fallback.id)
        }
      })
      .catch((err) => {
        console.error("Failed to load sessions", err)
        const fallback = createAiSession(`temp-${Date.now()}`)
        setSessions([fallback])
        setActiveSessionId(fallback.id)
      })
  }, [])

  // Load messages for active session dynamically
  React.useEffect(() => {
    if (!activeSessionId || activeSessionId.startsWith("temp-")) return

    const session = sessions.find((s) => s.id === activeSessionId)
    if (session && session.messages.length === 0) {
      setIsLoading(true)
      fetch(`/ai/sessions/${activeSessionId}/messages`)
        .then((res) => res.json())
        .then((data: AiMessage[]) => {
          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: data } : s))
          )
        })
        .catch((err) => console.error("Failed to load messages", err))
        .finally(() => setIsLoading(false))
    }
  }, [activeSessionId, sessions])

  // Auto-scroll when content changes
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, reasoningSteps, streamingContent, isLoading])

  // Typewriter buffer smoothing effect loop
  React.useEffect(() => {
    if (streamingContent === null) return

    let timer: number
    const tick = () => {
      const target = accumulatedRef.current
      const current = displayedRef.current

      if (current.length < target.length) {
        const diff = target.length - current.length
        // Dynamic speed based on buffer diff length
        const step = diff > 40 ? 6 : diff > 15 ? 3 : 1
        const nextText = current + target.slice(current.length, current.length + step)
        displayedRef.current = nextText
        setStreamingContent(nextText)
        timer = window.setTimeout(tick, 10)
      } else if (isStreamDoneRef.current) {
        setStreamingContent(null)
        setIsLoading(false)
        appendMessageStable(
          {
            role: "assistant",
            content: target,
            suggestions: finalSuggestionsRef.current,
          },
          finalConvIdRef.current
        )
      } else {
        timer = window.setTimeout(tick, 20)
      }
    }

    timer = window.setTimeout(tick, 10)
    return () => clearTimeout(timer)
  }, [streamingContent === null])

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession?.messages ?? []

  /** Append a completed message into the active session (stable — reads sessionId from ref) */
  const appendMessageStable = React.useCallback((newMsg: AiMessage, newSessionId?: string) => {
    setSessions((prev) => {
      const sessionId = activeSessionIdRef.current
      const updated = prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              id: newSessionId && sessionId.startsWith("temp-") ? newSessionId : session.id,
              messages: [...session.messages, newMsg],
            }
          : session
      )
      return updated
    })

    if (newSessionId && activeSessionIdRef.current.startsWith("temp-")) {
      setActiveSessionId(newSessionId)
    }
  }, [])

  /** Read and process the /ai/stream SSE response */
  async function consumeStream(
    text: string,
    snapshot: AiMessage[],
    signal: AbortSignal
  ) {
    const csrfToken =
      document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? ""

    const conversationId = activeSessionIdRef.current.startsWith("temp-")
      ? null
      : activeSessionIdRef.current

    const response = await fetch("/ai/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
      body: JSON.stringify({
        message: text,
        conversation_id: conversationId,
      }),
      signal,
    })

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let accumulated = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE lines are separated by \n\n; keep the incomplete last chunk in buffer
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const raw = line.slice(6).trim()
        if (!raw) continue

        let event: SseEvent
        try {
          event = JSON.parse(raw) as SseEvent
        } catch {
          continue
        }

        if (event.type === "step") {
          setReasoningSteps((prev) => (prev.includes(event.step) ? prev : [...prev, event.step]))

        } else if (event.type === "start") {
          setReasoningSteps([])
          accumulatedRef.current = ""
          displayedRef.current = ""
          isStreamDoneRef.current = false
          setStreamingContent("")   // open the live bubble

        } else if (event.type === "chunk") {
          accumulatedRef.current += event.text

        } else if (event.type === "done") {
          finalSuggestionsRef.current = event.suggestions
          finalConvIdRef.current = event.conversation_id
          isStreamDoneRef.current = true
          return

        } else if (event.type === "error") {
          setStreamingContent(null)
          setIsLoading(false)
          appendMessageStable({ role: "assistant", content: event.message, isError: true })
          return
        }
      }
    }
  }

  /** Core send — adds user message then opens SSE stream */
  async function sendWithHistory(text: string, snapshot: AiMessage[]) {
    // Cancel any ongoing stream
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setInput("")
    setReasoningSteps(["Menerima input Anda..."])
    setIsLoading(true)
    setStreamingContent(null)

    accumulatedRef.current = ""
    displayedRef.current = ""
    isStreamDoneRef.current = false
    finalSuggestionsRef.current = []
    finalConvIdRef.current = undefined

    try {
      // snapshot already contains the new user message at the end
      await consumeStream(text, snapshot.slice(0, -1), controller.signal)
    } catch (err) {
      if ((err as Error).name === "AbortError") return // intentional cancel

      setStreamingContent(null)
      setIsLoading(false)
      setReasoningSteps([])
      appendMessageStable({
        role: "assistant",
        content: "Koneksi ke asisten AI terputus. Pastikan server Ollama dengan model qwen2.5:3b Anda aktif.",
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
            ? textToSend.length > 22 ? `${textToSend.slice(0, 22)}...` : textToSend
            : session.title
        updatedMessages = [...session.messages, userMessage]
        return { ...session, title, messages: updatedMessages }
      })
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
      return updated
    })

    const cleanMessages = messages.filter((m) => !m.isError)
    const userMessage: AiMessage = { role: "user", content: text }
    await sendWithHistory(text, [...cleanMessages, userMessage])
  }

  const handleNewSession = () => {
    const session = createAiSession(`temp-${Date.now()}`)
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
  }

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!id.startsWith("temp-")) {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? ""
      fetch(`/ai/sessions/${id}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": csrfToken },
      }).catch((err) => console.error("Failed to delete session on server", err))
    }

    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      let activeId = activeSessionId

      if (activeSessionId === id) {
        if (updated.length === 0) {
          const fallback = createAiSession(`temp-${Date.now()}`)
          updated.push(fallback)
        }
        activeId = updated[0].id
        setActiveSessionId(activeId)
      }

      return updated
    })
  }

  // Abort any in-flight stream when unmounting
  React.useEffect(() => {
    return () => { abortControllerRef.current?.abort() }
  }, [])

  return {
    sessions,
    activeSessionId,
    messages,
    streamingContent,
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
