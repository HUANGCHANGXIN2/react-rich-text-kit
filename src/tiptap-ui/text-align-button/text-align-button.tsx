"use client"

import { forwardRef, useCallback } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type {
  TextAlign,
  UseTextAlignConfig,
} from "@/tiptap-ui/text-align-button"
import { useTextAlign } from "@/tiptap-ui/text-align-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/tiptap-ui-primitive/button"
import { Button } from "@/tiptap-ui-primitive/button"

type IconProps = React.SVGProps<SVGSVGElement>
type IconComponent = ({ className, ...props }: IconProps) => React.ReactElement

export interface TextAlignButtonProps
  extends Omit<ButtonProps, "type">, UseTextAlignConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  showShortcut?: never
  /**
   * Optional custom icon component to render instead of the default.
   */
  icon?: React.MemoExoticComponent<IconComponent> | React.FC<IconProps>
}

/**
 * Button component for setting text alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextAlign` hook instead.
 */
export const TextAlignButton = forwardRef<
  HTMLButtonElement,
  TextAlignButtonProps
>(
  (
    {
      editor: providedEditor,
      align,
      text,
      hideWhenUnavailable = false,
      onAligned,
      onClick,
      icon: CustomIcon,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      handleTextAlign,
      label,
      canAlign,
      isActive,
      Icon,
    } = useTextAlign({
      editor,
      align,
      hideWhenUnavailable,
      onAligned,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleTextAlign()
      },
      [handleTextAlign, onClick]
    )

    if (!isVisible) {
      return null
    }

    const RenderIcon = CustomIcon ?? Icon

    return (
      <Button
        type="button"
        disabled={!canAlign}
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={!canAlign}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <RenderIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

TextAlignButton.displayName = "TextAlignButton"
