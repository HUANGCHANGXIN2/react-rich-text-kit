import { forwardRef, useCallback, useMemo } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseColorHighlightConfig } from "@/tiptap-ui/color-highlight-button"
import { useColorHighlight } from "@/tiptap-ui/color-highlight-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/tiptap-ui-primitive/button"
import { Button } from "@/tiptap-ui-primitive/button"

// --- Styles ---

export interface ColorHighlightButtonProps
  extends Omit<ButtonProps, "type">, UseColorHighlightConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  showShortcut?: never
}

/**
 * Button component for applying color highlights in a Tiptap editor.
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 *
 * @example
 * ```tsx
 * <ColorHighlightButton highlightColor="yellow" />
 *
 * // With custom callback
 * <ColorHighlightButton
 *   highlightColor="red"
 *   mode="mark"
 *   onApplied={({ color, mode }) => console.log(`Applied ${color} in ${mode} mode`)}
 * />
 * ```
 */
export const ColorHighlightButton = forwardRef<
  HTMLButtonElement,
  ColorHighlightButtonProps
>(
  (
    {
      editor: providedEditor,
      highlightColor,
      text,
      hideWhenUnavailable = false,
      mode = "mark",
      onApplied,
      onClick,
      children,
      style,
      useColorValue = false,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      canColorHighlight,
      isActive,
      handleColorHighlight,
      label,
    } = useColorHighlight({
      editor,
      highlightColor,
      useColorValue,
      label: text || `Toggle highlight (${highlightColor})`,
      hideWhenUnavailable,
      mode,
      onApplied,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleColorHighlight()
      },
      [handleColorHighlight, onClick]
    )

    const buttonStyle = useMemo(
      () =>
        ({
          ...style,
          "--highlight-color": highlightColor,
        }) as React.CSSProperties,
      [highlightColor, style]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canColorHighlight}
        data-disabled={!canColorHighlight}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <span
              className="tiptap-button-highlight"
              style={
                { "--highlight-color": highlightColor } as React.CSSProperties
              }
            />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

ColorHighlightButton.displayName = "ColorHighlightButton"
