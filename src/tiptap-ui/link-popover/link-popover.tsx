"use client"

import { forwardRef, useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { CornerDownLeftIcon } from "@/tiptap-icons/corner-down-left-icon"
import { ExternalLinkIcon } from "@/tiptap-icons/external-link-icon"
import { LinkIcon } from "@/tiptap-icons/link-icon"
import { TrashIcon } from "@/tiptap-icons/trash-icon"

// --- Tiptap UI ---
import type { UseLinkPopoverConfig } from "@/tiptap-ui/link-popover"
import { useLinkPopover } from "@/tiptap-ui/link-popover"

// --- UI Primitives ---
import type { ButtonProps } from "@/tiptap-ui-primitive/button"
import { Button } from "@/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/tiptap-ui-primitive/popover"
import { Separator } from "@/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/tiptap-ui-primitive/card"
import { Input } from "@/tiptap-ui-primitive/input"
import { ButtonGroup } from "@/tiptap-ui-primitive/button-group"
import type { RichTextEditorLabels } from "@/labels"


export interface LinkMainProps {
  /**
   * The URL to set for the link.
   */
  url: string
  /**
   * Function to update the URL state.
   */
  setUrl: React.Dispatch<React.SetStateAction<string | null>>
  /**
   * Function to set the link in the editor.
   */
  setLink: () => void
  /**
   * Function to remove the link from the editor.
   */
  removeLink: () => void
  /**
   * Function to open the link.
   */
  openLink: () => void
  /**
   * Whether the link is currently active in the editor.
   */
  isActive: boolean
  labels: Pick<
    RichTextEditorLabels,
    | "linkPlaceholder"
    | "applyLink"
    | "openLink"
    | "removeLink"
  >
}

export interface LinkPopoverProps
  extends Omit<ButtonProps, "type">, UseLinkPopoverConfig {
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean
  labels?: RichTextEditorLabels
}

/**
 * Link button component for triggering the link popover
 */
export const LinkButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        type="button"
        className={className}
        variant="ghost"
        role="button"
        tabIndex={-1}
        aria-label="链接"
        tooltip="链接"
        ref={ref}
        {...props}
      >
        {children || <LinkIcon className="tiptap-button-icon" />}
      </Button>
    )
  }
)

LinkButton.displayName = "LinkButton"

/**
 * Main content component for the link popover
 */
const LinkMain: React.FC<LinkMainProps> = ({
  url,
  setUrl,
  setLink,
  removeLink,
  openLink,
  isActive,
  labels,
}) => {
  const isMobile = useIsBreakpoint()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      setLink()
    }
  }

  return (
    <Card
      style={{
        ...(isMobile ? { boxShadow: "none", border: 0 } : {}),
      }}
    >
      <CardBody
        style={{
          ...(isMobile ? { padding: 0 } : {}),
        }}
      >
        <CardItemGroup orientation="horizontal">
          <Input
            type="url"
            placeholder={labels.linkPlaceholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="tiptap-link-input"
          />

          <ButtonGroup>
            <Button
              type="button"
              onClick={setLink}
              title={labels.applyLink}
              disabled={!url && !isActive}
              variant="ghost"
            >
              <CornerDownLeftIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>

          <Separator />

          <ButtonGroup>
            <ButtonGroup>
              <Button
                type="button"
                onClick={openLink}
                title={labels.openLink}
                disabled={!url && !isActive}
                variant="ghost"
              >
                <ExternalLinkIcon className="tiptap-button-icon" />
              </Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button
                type="button"
                onClick={removeLink}
                title={labels.removeLink}
                disabled={!url && !isActive}
                variant="ghost"
              >
                <TrashIcon className="tiptap-button-icon" />
              </Button>
            </ButtonGroup>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

/**
 * Link content component for standalone use
 */
export const LinkContent: React.FC<{
  editor?: Editor | null
  labels: RichTextEditorLabels
}> = ({ editor, labels }) => {
  const linkPopover = useLinkPopover({
    editor,
  })

  return <LinkMain {...linkPopover} labels={labels} />
}

/**
 * Link popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
export const LinkPopover = forwardRef<HTMLButtonElement, LinkPopoverProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      onSetLink,
      onOpenChange,
      autoOpenOnLinkActive = true,
      labels,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = useState(false)

    const {
      isVisible,
      canSet,
      isActive,
      url,
      setUrl,
      setLink,
      removeLink,
      openLink,
      label,
      Icon,
    } = useLinkPopover({
      editor,
      hideWhenUnavailable,
      onSetLink,
    })

    const handleOnOpenChange = useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen)
        onOpenChange?.(nextIsOpen)
      },
      [onOpenChange]
    )

    const handleSetLink = useCallback(() => {
      setLink()
      setIsOpen(false)
    }, [setLink])

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        setIsOpen(!isOpen)
      },
      [onClick, isOpen]
    )

    useEffect(() => {
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(true)
      }
    }, [autoOpenOnLinkActive, isActive])

    if (!isVisible) {
      return null
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <LinkButton
            disabled={!canSet}
            data-active-state={isActive ? "on" : "off"}
            data-disabled={!canSet}
            aria-label={label}
            aria-pressed={isActive}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <Icon className="tiptap-button-icon" />}
          </LinkButton>
        </PopoverTrigger>

        <PopoverContent>
          <LinkMain
            url={url}
            setUrl={setUrl}
            setLink={handleSetLink}
            removeLink={removeLink}
            openLink={openLink}
            isActive={isActive}
            labels={
              labels ?? {
                linkPlaceholder: "粘贴链接...",
                applyLink: "应用链接",
                openLink: "在新窗口打开",
                removeLink: "移除链接",
              }
            }
          />
        </PopoverContent>
      </Popover>
    )
  }
)

LinkPopover.displayName = "LinkPopover"

export default LinkPopover
