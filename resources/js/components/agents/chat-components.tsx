"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import {
  BotIcon,
  SparklesIcon,
  Loader2Icon,
  CopyIcon,
  RefreshCwIcon,
  CheckIcon,
} from "lucide-react"
import { AiMessage } from "@/types/ai"

// ─── Bot Avatar ───────────────────────────────────────────────────────────────

export function BotAvatar() {
  return (
    <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-lg border bg-muted text-violet-500">
      <BotIcon className="size-4" />
    </div>
  )
}

// ─── User Avatar ──────────────────────────────────────────────────────────────

interface UserAvatarProps {
  avatarUrl?: string | null
  name?: string
}

export function UserAvatar({ avatarUrl, name }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? "User"}
        className="size-8 shrink-0 select-none rounded-lg border object-cover"
      />
    )
  }
  const initials = (name ?? "U").charAt(0).toUpperCase()
  return (
    <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-lg border bg-violet-600/10 text-violet-600 text-xs font-semibold">
      {initials}
    </div>
  )
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-0.5 first:mt-0">{children}</h3>,
        // Paragraphs
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        // Lists
        ul: ({ children }) => <ul className="mb-2 ml-4 space-y-0.5 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 space-y-0.5 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        // Inline
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        // Code
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-")
          return isBlock ? (
            <code className="block bg-black/20 rounded-md px-3 py-2 text-xs font-mono my-2 whitespace-pre-wrap">
              {children}
            </code>
          ) : (
            <code className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
          )
        },
        pre: ({ children }) => <>{children}</>,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-violet-400 pl-3 my-2 text-muted-foreground italic">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="border-border my-2" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  msg: AiMessage
  isLastUserMessage: boolean
  isLastMessage: boolean
  isCopied: boolean
  onCopy: () => void
  onRetry: (text: string) => void
  onSuggestion: (text: string) => void
  userAvatarUrl?: string | null
  userName?: string
}

export function MessageBubble({
  msg,
  isLastUserMessage,
  isLastMessage,
  isCopied,
  onCopy,
  onRetry,
  onSuggestion,
  userAvatarUrl,
  userName,
}: MessageBubbleProps) {
  const isUser = msg.role === "user"
  const showRetry = (isUser && isLastUserMessage) || (!isUser && msg.isError)
  const hasSuggestions = isLastMessage && !isUser && !msg.isError && (msg.suggestions?.length ?? 0) > 0

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar + bubble row */}
      <div className={`group flex gap-3 max-w-[88%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
        {isUser ? (
          <UserAvatar avatarUrl={userAvatarUrl} name={userName} />
        ) : (
          <BotAvatar />
        )}

        <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
          {/* Bubble */}
          <div
            className={`rounded-lg px-3 py-2.5 text-sm ${
              isUser
                ? "bg-violet-600 text-white shadow-sm"
                : msg.isError
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-muted text-foreground"
            }`}
          >
            {isUser ? (
              <span className="leading-relaxed">{msg.content}</span>
            ) : (
              <MarkdownContent content={msg.content} />
            )}
          </div>

          {/* Hover action row */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded text-muted-foreground hover:text-foreground"
              title="Salin pesan"
              onClick={onCopy}
            >
              {isCopied ? (
                <CheckIcon className="size-3 text-green-500" />
              ) : (
                <CopyIcon className="size-3" />
              )}
            </Button>

            {showRetry && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded text-muted-foreground hover:text-violet-600"
                title="Coba lagi"
                onClick={() => onRetry(isUser ? msg.content : "")}
              >
                <RefreshCwIcon className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up suggestion chips */}
      {hasSuggestions && (
        <div className="ml-11 flex flex-col gap-1.5 max-w-[88%] animate-in fade-in slide-in-from-bottom-1 duration-500 delay-150">
          <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <SparklesIcon className="size-3 text-violet-500 animate-pulse" />
            <span>Rekomendasi Pertanyaan:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {msg.suggestions!.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestion(s)}
                className="text-[11px] text-left px-2.5 py-1.5 rounded-lg bg-violet-500/8 hover:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer leading-snug"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reasoning Steps ──────────────────────────────────────────────────────────

interface ReasoningStepsProps {
  steps: string[]
  isLoading: boolean
}

export function ReasoningSteps({ steps, isLoading }: ReasoningStepsProps) {
  return (
    <div className="bg-violet-500/5 border border-violet-500/10 rounded-lg p-3 text-xs space-y-1.5 max-w-[85%] mr-auto text-violet-600 dark:text-violet-400">
      <div className="font-semibold flex items-center gap-1.5 text-violet-700 dark:text-violet-300">
        <SparklesIcon className="size-3 text-violet-500 animate-pulse" />
        <span>Proses Berpikir Asisten:</span>
      </div>
      <div className="space-y-1 pl-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-muted-foreground">
            {idx === steps.length - 1 && isLoading ? (
              <Loader2Icon className="size-3 animate-spin text-violet-500" />
            ) : (
              <span className="text-violet-500 font-bold">✓</span>
            )}
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto items-center">
      <BotAvatar />
      <div className="rounded-lg px-3 py-2 bg-muted text-muted-foreground text-sm flex items-center gap-1.5 italic">
        <Loader2Icon className="size-3.5 animate-spin" />
        <span>Mengetik...</span>
      </div>
    </div>
  )
}

// ─── Streaming Bubble ─────────────────────────────────────────────────────────

/**
 * Live typing bubble shown while the SSE stream is in progress.
 * Renders the accumulated text with Markdown and a blinking cursor.
 */
export function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-3 max-w-[88%] mr-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BotAvatar />
      <div className="rounded-lg px-3 py-2.5 text-sm bg-muted text-foreground">
        {content ? (
          <MarkdownContent content={content} />
        ) : (
          <span className="italic text-muted-foreground">Mengetik</span>
        )}
        {/* Blinking cursor */}
        <span className="inline-block w-0.5 h-3.5 bg-violet-500 ml-0.5 align-middle animate-pulse" />
      </div>
    </div>
  )
}
