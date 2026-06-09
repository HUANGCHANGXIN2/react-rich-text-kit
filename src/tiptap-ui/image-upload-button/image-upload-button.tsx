import { forwardRef, useCallback, useState } from "react"

// --- Lib ---
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseImageUploadConfig } from "@/tiptap-ui/image-upload-button"
import {
  IMAGE_UPLOAD_SHORTCUT_KEY,
  useImageUpload,
} from "@/tiptap-ui/image-upload-button"

// --- Icons ---
import { ChevronDownIcon } from "@/tiptap-icons/chevron-down-icon"
import { CornerDownLeftIcon } from "@/tiptap-icons/corner-down-left-icon"
import { LinkIcon } from "@/tiptap-icons/link-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/tiptap-ui-primitive/button"
import { Button } from "@/tiptap-ui-primitive/button"
import { ButtonGroup } from "@/tiptap-ui-primitive/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/tiptap-ui-primitive/dropdown-menu"
import { Input } from "@/tiptap-ui-primitive/input"
import type { RichTextEditorLabels } from "@/labels"

type IconProps = React.SVGProps<SVGSVGElement>
type IconComponent = ({ className, ...props }: IconProps) => React.ReactElement
type ImageUploadButtonLabels = Pick<
  RichTextEditorLabels,
  | "imageUpload"
  | "imageUploadFromFile"
  | "imageUploadFromUrl"
  | "imageUrlPlaceholder"
  | "imageUrlInvalid"
  | "applyImageUrl"
>

const DEFAULT_LABELS: ImageUploadButtonLabels = {
  imageUpload: "添加图片",
  imageUploadFromFile: "上传图片",
  imageUploadFromUrl: "图片 URL",
  imageUrlPlaceholder: "粘贴图片 URL...",
  imageUrlInvalid: "请输入有效的图片 URL",
  applyImageUrl: "插入图片",
}

function normalizeImageUrl(value: string): string | null {
  const trimmedUrl = value.trim()

  if (!trimmedUrl) return null

  try {
    const url = new URL(trimmedUrl)
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href
    }
  } catch {
    return null
  }

  return null
}

export interface ImageUploadButtonProps
  extends Omit<ButtonProps, "type">, UseImageUploadConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  showShortcut?: never
  /**
   * Optional custom icon component to render instead of the default.
   */
  icon?: React.MemoExoticComponent<IconComponent> | React.FC<IconProps>
  /**
   * Whether the dropdown should use a modal.
   * @default false
   */
  modal?: boolean
  labels?: Partial<ImageUploadButtonLabels>
}

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
export const ImageUploadButton = forwardRef<
  HTMLButtonElement,
  ImageUploadButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      enableFileUpload = true,
      onInserted,
      onClick,
      icon: CustomIcon,
      modal = false,
      labels,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = useState(false)
    const [isUrlFormOpen, setIsUrlFormOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState("")
    const [urlError, setUrlError] = useState<string | null>(null)
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels }
    const {
      isVisible,
      canInsert,
      canUpload,
      canInsertUrl,
      handleImage,
      handleImageUrl,
      label,
      isActive,
      Icon,
    } = useImageUpload({
      editor,
      hideWhenUnavailable,
      enableFileUpload,
      onInserted,
    })

    const handleOpenChange = useCallback((open: boolean) => {
      setIsOpen(open)

      if (!open) {
        setIsUrlFormOpen(false)
        setUrlError(null)
      }
    }, [])

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
      },
      [onClick]
    )

    const handleFileUpload = useCallback(() => {
      if (!canUpload) return

      const success = handleImage()
      if (success) {
        setIsOpen(false)
      }
    }, [canUpload, handleImage])

    const handleUrlOption = useCallback(
      (event: Event) => {
        if (!canInsertUrl) return

        event.preventDefault()
        setIsUrlFormOpen(true)
        setUrlError(null)
      },
      [canInsertUrl]
    )

    const handleImageUrlSubmit = useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedUrl = normalizeImageUrl(imageUrl)

        if (!normalizedUrl) {
          setUrlError(resolvedLabels.imageUrlInvalid)
          return
        }

        const success = handleImageUrl(normalizedUrl)

        if (success) {
          setImageUrl("")
          setUrlError(null)
          setIsUrlFormOpen(false)
          setIsOpen(false)
          return
        }

        setUrlError(resolvedLabels.imageUrlInvalid)
      },
      [handleImageUrl, imageUrl, resolvedLabels.imageUrlInvalid]
    )

    if (!isVisible) {
      return null
    }

    const RenderIcon = CustomIcon ?? Icon
    const buttonLabel = resolvedLabels.imageUpload || label

    return (
      <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            data-active-state={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canInsert}
            data-disabled={!canInsert}
            aria-label={buttonLabel}
            aria-pressed={isActive}
            tooltip={buttonLabel}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? (
              <>
                <RenderIcon className="tiptap-button-icon" />
                {text && <span className="tiptap-button-text">{text}</span>}
                <ChevronDownIcon className="tiptap-button-dropdown-small" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              disabled={!canUpload}
              onSelect={handleFileUpload}
            >
              <Button
                type="button"
                variant="ghost"
                disabled={!canUpload}
                showTooltip={false}
                className="tiptap-image-menu-item"
              >
                <RenderIcon className="tiptap-button-icon" />
                <span className="tiptap-button-text">
                  {resolvedLabels.imageUploadFromFile}
                </span>
              </Button>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              disabled={!canInsertUrl}
              onSelect={handleUrlOption}
            >
              <Button
                type="button"
                variant="ghost"
                disabled={!canInsertUrl}
                showTooltip={false}
                className="tiptap-image-menu-item"
              >
                <LinkIcon className="tiptap-button-icon" />
                <span className="tiptap-button-text">
                  {resolvedLabels.imageUploadFromUrl}
                </span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {isUrlFormOpen && (
            <>
              <DropdownMenuSeparator />
              <form
                className="tiptap-image-url-form"
                onSubmit={handleImageUrlSubmit}
                noValidate
              >
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value)
                    setUrlError(null)
                  }}
                  placeholder={resolvedLabels.imageUrlPlaceholder}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="tiptap-image-url-input"
                  aria-invalid={Boolean(urlError)}
                />

                <ButtonGroup>
                  <Button
                    type="submit"
                    variant="ghost"
                    disabled={!canInsertUrl || !imageUrl.trim()}
                    showTooltip={false}
                    title={resolvedLabels.applyImageUrl}
                    aria-label={resolvedLabels.applyImageUrl}
                  >
                    <CornerDownLeftIcon className="tiptap-button-icon" />
                  </Button>
                </ButtonGroup>

                {urlError && (
                  <span className="tiptap-image-url-error">{urlError}</span>
                )}
              </form>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

ImageUploadButton.displayName = "ImageUploadButton"
