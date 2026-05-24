import * as React from "react"
import {
  AiChatSession,
  AiMessage,
  createAiSession,
  loadAiSessions,
  saveAiSessions,
} from "@/types/ai"

// ─── SSE event shape from /ai/stream ─────────────────────────────────────────

type SseEvent =
  | { type: "step"; step: string }
  | { type: "start" }
  | { type: "chunk"; text: string }
  | { type: "done"; suggestions: string[] }
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

  // Load sessions on mount
  React.useEffect(() => {
    const loaded = loadAiSessions()
    setSessions(loaded)
    setActiveSessionId(loaded[0].id)
  }, [])

  // Auto-scroll when content changes
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, reasoningSteps, streamingContent, isLoading])

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession?.messages ?? []

  /** Append a completed message into the active session (stable — reads sessionId from ref) */
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
  }, [])

  /** Read and process the /ai/stream SSE response */
  async function consumeStream(
    text: string,
    snapshot: AiMessage[],
    signal: AbortSignal
  ) {
    const csrfToken =
      document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? ""

    const response = await fetch("/ai/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
      body: JSON.stringify({
        message: text,
        history: snapshot.map(({ role, content }) => ({ role, content })),
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
          setStreamingContent("")   // open the live bubble

        } else if (event.type === "chunk") {
          accumulated += event.text
          setStreamingContent(accumulated)

        } else if (event.type === "done") {
          setStreamingContent(null)
          setIsLoading(false)
          appendMessageStable({
            role: "assistant",
            content: accumulated,
            suggestions: event.suggestions,
          })
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
