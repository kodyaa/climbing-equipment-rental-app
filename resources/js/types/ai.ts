// AI chat feature types

export interface AiMessage {
  role: "user" | "assistant" | "system"
  content: string
  isError?: boolean
  suggestions?: string[]
}

export interface AiChatSession {
  id: string
  title: string
  messages: AiMessage[]
  createdAt: string
}

export const AI_WELCOME_MESSAGE: AiMessage = {
  role: "assistant",
  content: "Halo! Saya Asisten Operasional SummitRent. Saya siap membantu Anda (kasir/owner) dalam mengelola transaksi sewa, stok produk, data pelanggan, dan laporan aplikasi.",
  suggestions: [
    "Bagaimana cara membuat transaksi sewa baru?",
    "Bagaimana cara melihat laporan pendapatan hari ini?",
    "Bagaimana cara mengecek stok produk yang hampir habis?",
  ],
}

export const AI_QUICK_PROMPTS = [
  "Bagaimana cara membuat transaksi sewa baru?",
  "Bagaimana cara memproses pengembalian barang?",
  "Bagaimana cara melihat laporan & analitik?",
  "Bagaimana cara mengelola data pelanggan?",
]

export const AI_STORAGE_KEY = "summitrent-ai-sessions"

export function createAiSession(id?: string): AiChatSession {
  return {
    id: id ?? `session-${Date.now()}`,
    title: "Obrolan Baru",
    messages: [AI_WELCOME_MESSAGE],
    createdAt: new Date().toLocaleDateString("id-ID"),
  }
}

export function loadAiSessions(): AiChatSession[] {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AiChatSession[]
      if (parsed.length > 0) return parsed
    }
  } catch {
    // ignore corrupt storage
  }
  const defaultSession = createAiSession("session-1")
  saveAiSessions([defaultSession])
  return [defaultSession]
}

export function saveAiSessions(sessions: AiChatSession[]): void {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(sessions))
}
