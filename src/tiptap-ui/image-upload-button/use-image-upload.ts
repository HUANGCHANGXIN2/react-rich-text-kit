"use client"

import { useCallback, useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useHotkeys } from "@/hooks/use-hotkeys"

// --- Lib ---
import { isExtensionAvailable } from "@/lib/tiptap-utils"

// --- Icons ---
import { ImagePlusIcon } from "@/tiptap-icons/image-plus-icon"

export const IMAGE_UPLOAD_SHORTCUT_KEY = "mod+shift+i"

/**
 * Configuration for the image upload functionality
 */
export interface UseImageUploadConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when insertion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Whether image upload through files is enabled.
   * @default true
   */
  enableFileUpload?: boolean
  /**
   * Callback function called after a successful image insertion.
   */
  onInserted?: () => void
}

/**
 * Checks if image can be inserted in the current editor state
 */
export function canInsertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "imageUpload")) return false

  return editor.can().insertContent({ type: "imageUpload" })
}

/**
 * Checks if an image URL can be inserted in the current editor state
 */
export function canInsertImageUrl(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "image")) return false

  return editor
    .can()
    .insertContent({
      type: "image",
      attrs: { src: "https://example.com/image.png" },
    })
}

/**
 * Checks if image is currently active
 */
export function isImageActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive("imageUpload")
}

/**
 * Inserts an image in the editor
 */
export function insertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertImage(editor)) return false

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: "imageUpload",
      })
      .run()
  } catch {
    return false
  }
}

/**
 * Inserts an image by URL in the editor
 */
export function insertImageUrl(editor: Editor | null, url: string): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertImageUrl(editor)) return false

  try {
    return editor.chain().focus().setImage({ src: url }).run()
  } catch {
    return false
  }
}

/**
 * Determines if the image button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  enableFileUpload: boolean
}): boolean {
  const { editor, hideWhenUnavailable, enableFileUpload } = props

  if (!editor || !editor.isEditable) return false

  if (!hideWhenUnavailable) {
    return true
  }

  const canUpload = enableFileUpload && canInsertImage(editor)
  const canInsertUrl = canInsertImageUrl(editor)

  if (!editor.isActive("code")) {
    return canUpload || canInsertUrl
  }

  return true
}

/**
 * Custom hook that provides image functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleImageButton() {
 *   const { isVisible, handleImage } = useImage()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleImage}>Add Image</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedImageButton() {
 *   const { isVisible, handleImage, label, isActive } = useImage({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onInserted: () => console.log('Image inserted!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleImage}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Add Image
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useImageUpload(config?: UseImageUploadConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    enableFileUpload = true,
    onInserted,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsBreakpoint()
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canUpload = enableFileUpload && canInsertImage(editor)
  const canInsertUrl = canInsertImageUrl(editor)
  const canInsert = canUpload || canInsertUrl
  const isActive = isImageActive(editor)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable, enableFileUpload })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable, enableFileUpload])

  const handleImage = useCallback(() => {
    if (!editor) return false

    const success = insertImage(editor)
    if (success) {
      onInserted?.()
    }
    return success
  }, [editor, onInserted])

  const handleImageUrl = useCallback(
    (url: string) => {
      if (!editor) return false

      const success = insertImageUrl(editor, url)
      if (success) {
        onInserted?.()
      }
      return success
    },
    [editor, onInserted]
  )

  useHotkeys(
    IMAGE_UPLOAD_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleImage()
    },
    {
      enabled: isVisible && canUpload,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  )

  return {
    isVisible,
    isActive,
    handleImage,
    handleImageUrl,
    canInsert,
    canUpload,
    canInsertUrl,
    label: "Add image",
    shortcutKeys: IMAGE_UPLOAD_SHORTCUT_KEY,
    Icon: ImagePlusIcon,
  }
}
