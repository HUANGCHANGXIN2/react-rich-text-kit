import { forwardRef, Fragment, useMemo } from "react"

// --- Lib ---
import { cn, parseShortcutKeys } from "@/lib/tiptap-utils"

export type ButtonVariant = "ghost" | "primary"
export type ButtonSize = "small" | "default" | "large"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
  variant?: ButtonVariant
  size?: ButtonSize
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  )
}

function getTooltipTitle(
  tooltip: React.ReactNode,
  shortcuts: string[],
  explicitTitle?: string
) {
  if (explicitTitle) return explicitTitle
  if (typeof tooltip !== "string" && typeof tooltip !== "number") return undefined

  const shortcutText = shortcuts.join("+")
  return shortcutText ? `${tooltip} (${shortcutText})` : String(tooltip)
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      title,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    const shortcuts = useMemo<string[]>(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )
    const tooltipTitle = showTooltip
      ? getTooltipTitle(tooltip, shortcuts, title)
      : title

    return (
      <button
        data-slot="tiptap-button"
        className={cn("tiptap-button", className)}
        ref={ref}
        data-style={variant}
        data-size={size}
        title={tooltipTitle}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
