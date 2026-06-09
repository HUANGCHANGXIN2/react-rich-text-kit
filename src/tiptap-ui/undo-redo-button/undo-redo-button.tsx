"use client"

import { forwardRef, useCallback } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type {
  UndoRedoAction,
  UseUndoRedoConfig,
} from "@/tiptap-ui/undo-redo-button"
import { useUndoRedo } from "@/tiptap-ui/undo-redo-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/tiptap-ui-primitive/button"
import { Button } from "@/tiptap-ui-primitive/button"

export interface UndoRedoButtonProps
  extends Omit<ButtonProps, "type">, UseUndoRedoConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  showShortcut?: never
}

/**
 * Button component for triggering undo/redo actions in a Tiptap editor.
 *
 * For custom button implementations, use the `useHistory` hook instead.
 */
export const UndoRedoButton = forwardRef<
  HTMLButtonElement,
  UndoRedoButtonProps
>(
  (
    {
      editor: providedEditor,
      action,
      text,
      hideWhenUnavailable = false,
      onExecuted,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { isVisible, handleAction, label, canExecute, Icon } = useUndoRedo({
        editor,
        action,
        hideWhenUnavailable,
        onExecuted,
      })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleAction()
      },
      [handleAction, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        disabled={!canExecute}
        variant="ghost"
        data-disabled={!canExecute}
        role="button"
        tabIndex={-1}
        aria-label={label}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

UndoRedoButton.displayName = "UndoRedoButton"
