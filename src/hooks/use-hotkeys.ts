import { useEffect, useRef } from "react"

interface HotkeyOptions {
  enabled?: boolean
  enableOnContentEditable?: boolean
  enableOnFormTags?: boolean
}

type HotkeyHandler = (event: KeyboardEvent) => void

function hasShortcutPart(parts: string[], ...matches: string[]) {
  return matches.some((match) => parts.includes(match))
}

function shouldIgnoreTarget(
  target: EventTarget | null,
  enableOnContentEditable: boolean,
  enableOnFormTags: boolean
) {
  if (!(target instanceof HTMLElement)) return false

  return (
    (!enableOnFormTags && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) ||
    (!enableOnContentEditable && target.isContentEditable)
  )
}

function matchesHotkey(event: KeyboardEvent, shortcut: string) {
  const parts = shortcut.split("+").map((part) => part.trim().toLowerCase())
  const hasMod = parts.includes("mod")

  if (event.key.toLowerCase() !== parts[parts.length - 1]) return false
  if (event.shiftKey !== parts.includes("shift")) return false
  if (event.altKey !== hasShortcutPart(parts, "alt", "option")) return false
  if (hasMod) return event.metaKey || event.ctrlKey

  return (
    event.metaKey === hasShortcutPart(parts, "meta", "cmd", "command") &&
    event.ctrlKey === hasShortcutPart(parts, "ctrl", "control")
  )
}

export function useHotkeys(
  shortcut: string,
  handler: HotkeyHandler,
  options: HotkeyOptions = {}
) {
  const handlerRef = useRef(handler)
  const {
    enabled = true,
    enableOnContentEditable = false,
    enableOnFormTags = false,
  } = options

  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        shouldIgnoreTarget(
          event.target,
          enableOnContentEditable,
          enableOnFormTags
        )
      ) {
        return
      }

      if (!matchesHotkey(event, shortcut)) return

      handlerRef.current(event)
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [enableOnContentEditable, enableOnFormTags, enabled, shortcut])
}
