'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Selection } from '@tiptap/extensions'
import {
  EditorContent,
  EditorContext,
  useEditor,
  type Editor,
  type JSONContent,
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'

import type {
  RichTextEditorLabels,
  RichTextEditorTool,
} from '@/labels'
import { resolveLabels } from '@/labels'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint'
import { useWindowSize } from '@/hooks/use-window-size'
import { cn } from '@/lib/tiptap-utils'
import { ArrowLeftIcon } from '@/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '@/tiptap-icons/highlighter-icon'
import { LinkIcon } from '@/tiptap-icons/link-icon'
import { HorizontalRule } from '@/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import {
  ImageUploadNode,
  type UploadFunction,
} from '@/tiptap-node/image-upload-node/image-upload-node-extension'
import { Button } from '@/tiptap-ui-primitive/button'
import { Spacer } from '@/tiptap-ui-primitive/spacer'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/tiptap-ui-primitive/toolbar'
import { BlockquoteButton } from '@/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/tiptap-ui/code-block-button'
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from '@/tiptap-ui/color-highlight-popover'
import { HeadingDropdownMenu } from '@/tiptap-ui/heading-dropdown-menu'
import { ImageUploadButton } from '@/tiptap-ui/image-upload-button'
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from '@/tiptap-ui/link-popover'
import { ListDropdownMenu } from '@/tiptap-ui/list-dropdown-menu'
import { MarkButton } from '@/tiptap-ui/mark-button'
import { TextAlignButton } from '@/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/tiptap-ui/undo-redo-button'

export type { JSONContent, UploadFunction }
export type { RichTextEditorLabels, RichTextEditorTool }

export interface RichTextEditorChange {
  html: string
  json: JSONContent
  text: string
  editor: Editor
}

export interface RichTextEditorProps {
  value?: string | JSONContent
  defaultValue?: string | JSONContent
  onChange?: (change: RichTextEditorChange) => void
  editable?: boolean
  placeholder?: string
  className?: string
  contentClassName?: string
  minHeight?: number | string
  maxHeight?: number | string
  uploadImage?: UploadFunction
  maxImageSize?: number
  imageUploadLimit?: number
  hiddenTools?: RichTextEditorTool[]
  labels?: Partial<RichTextEditorLabels>
}

const DEFAULT_MAX_IMAGE_SIZE = 5 * 1024 * 1024
const DEFAULT_IMAGE_UPLOAD_LIMIT = 3

function toCssSize(value?: number | string) {
  if (typeof value === 'number') return `${value}px`
  return value
}

function visible(
  hiddenTools: ReadonlySet<RichTextEditorTool>,
  tool: RichTextEditorTool
) {
  return !hiddenTools.has(tool)
}

function emitChange(editor: Editor, onChange?: RichTextEditorProps['onChange']) {
  onChange?.({
    html: editor.getHTML(),
    json: editor.getJSON(),
    text: editor.getText(),
    editor,
  })
}

function MainToolbarContent({
  labels,
  hiddenTools,
  canUploadImage,
  isMobile,
  onHighlighterClick,
  onLinkClick,
}: {
  labels: RichTextEditorLabels
  hiddenTools: ReadonlySet<RichTextEditorTool>
  canUploadImage: boolean
  isMobile: boolean
  onHighlighterClick: () => void
  onLinkClick: () => void
}) {
  const listTypes = [
    ...(visible(hiddenTools, 'bulletList') ? (['bulletList'] as const) : []),
    ...(visible(hiddenTools, 'orderedList') ? (['orderedList'] as const) : []),
    ...(visible(hiddenTools, 'taskList') ? (['taskList'] as const) : []),
  ]

  return (
    <>
      <Spacer />

      <ToolbarGroup>
        {visible(hiddenTools, 'undo') && (
          <UndoRedoButton
            action='undo'
            aria-label={labels.undo}
            tooltip={labels.undo}
          />
        )}
        {visible(hiddenTools, 'redo') && (
          <UndoRedoButton
            action='redo'
            aria-label={labels.redo}
            tooltip={labels.redo}
          />
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        {visible(hiddenTools, 'heading') && (
          <HeadingDropdownMenu
            modal={false}
            levels={[1, 2, 3, 4]}
            aria-label={labels.heading}
            tooltip={labels.heading}
            text={labels.heading}
            headingLabel={labels.headingLevel}
          />
        )}
        {listTypes.length > 0 && (
          <ListDropdownMenu
            modal={false}
            types={listTypes}
            aria-label={labels.bulletList}
            tooltip={labels.bulletList}
            labels={{
              bulletList: labels.bulletList,
              orderedList: labels.orderedList,
              taskList: labels.taskList,
            }}
          />
        )}
        {visible(hiddenTools, 'blockquote') && (
          <BlockquoteButton
            aria-label={labels.blockquote}
            tooltip={labels.blockquote}
          />
        )}
        {visible(hiddenTools, 'codeBlock') && (
          <CodeBlockButton
            aria-label={labels.codeBlock}
            tooltip={labels.codeBlock}
          />
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        {visible(hiddenTools, 'bold') && (
          <MarkButton
            type='bold'
            aria-label={labels.bold}
            tooltip={labels.bold}
          />
        )}
        {visible(hiddenTools, 'italic') && (
          <MarkButton
            type='italic'
            aria-label={labels.italic}
            tooltip={labels.italic}
          />
        )}
        {visible(hiddenTools, 'strike') && (
          <MarkButton
            type='strike'
            aria-label={labels.strike}
            tooltip={labels.strike}
          />
        )}
        {visible(hiddenTools, 'code') && (
          <MarkButton
            type='code'
            aria-label={labels.code}
            tooltip={labels.code}
          />
        )}
        {visible(hiddenTools, 'underline') && (
          <MarkButton
            type='underline'
            aria-label={labels.underline}
            tooltip={labels.underline}
          />
        )}
        {visible(hiddenTools, 'highlight') &&
          (!isMobile ? (
            <ColorHighlightPopover
              aria-label={labels.highlight}
              tooltip={labels.highlight}
              label={labels.highlight}
              removeLabel={labels.removeHighlight}
              highlightColorsLabel={labels.highlightColors}
              highlightColorLabel={labels.highlightColor}
            />
          ) : (
            <ColorHighlightPopoverButton
              onClick={onHighlighterClick}
              aria-label={labels.highlight}
              tooltip={labels.highlight}
            />
          ))}
        {visible(hiddenTools, 'link') &&
          (!isMobile ? (
            <LinkPopover
              aria-label={labels.link}
              tooltip={labels.link}
              labels={labels}
            />
          ) : (
            <LinkButton
              onClick={onLinkClick}
              aria-label={labels.link}
              tooltip={labels.link}
            />
          ))}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        {visible(hiddenTools, 'superscript') && (
          <MarkButton
            type='superscript'
            aria-label={labels.superscript}
            tooltip={labels.superscript}
          />
        )}
        {visible(hiddenTools, 'subscript') && (
          <MarkButton
            type='subscript'
            aria-label={labels.subscript}
            tooltip={labels.subscript}
          />
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        {visible(hiddenTools, 'alignLeft') && (
          <TextAlignButton
            align='left'
            aria-label={labels.alignLeft}
            tooltip={labels.alignLeft}
          />
        )}
        {visible(hiddenTools, 'alignCenter') && (
          <TextAlignButton
            align='center'
            aria-label={labels.alignCenter}
            tooltip={labels.alignCenter}
          />
        )}
        {visible(hiddenTools, 'alignRight') && (
          <TextAlignButton
            align='right'
            aria-label={labels.alignRight}
            tooltip={labels.alignRight}
          />
        )}
        {visible(hiddenTools, 'alignJustify') && (
          <TextAlignButton
            align='justify'
            aria-label={labels.alignJustify}
            tooltip={labels.alignJustify}
          />
        )}
      </ToolbarGroup>

      {visible(hiddenTools, 'imageUpload') && (
        <>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ImageUploadButton
              aria-label={labels.imageUpload}
              tooltip={labels.imageUpload}
              enableFileUpload={canUploadImage}
              labels={labels}
            />
          </ToolbarGroup>
        </>
      )}

      <Spacer />
      {isMobile && <ToolbarSeparator />}
    </>
  )
}

function MobileToolbarContent({
  type,
  labels,
  onBack,
}: {
  type: 'highlighter' | 'link'
  labels: RichTextEditorLabels
  onBack: () => void
}) {
  return (
    <>
      <ToolbarGroup>
        <Button variant='ghost' onClick={onBack}>
          <ArrowLeftIcon className='tiptap-button-icon' />
          {type === 'highlighter' ? (
            <HighlighterIcon className='tiptap-button-icon' />
          ) : (
            <LinkIcon className='tiptap-button-icon' />
          )}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {type === 'highlighter' ? (
        <ColorHighlightPopoverContent
          removeLabel={labels.removeHighlight}
          highlightColorLabel={labels.highlightColor}
        />
      ) : (
        <LinkContent labels={labels} />
      )}
    </>
  )
}

export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  editable = true,
  placeholder,
  className,
  contentClassName,
  minHeight = 360,
  maxHeight,
  uploadImage,
  maxImageSize = DEFAULT_MAX_IMAGE_SIZE,
  imageUploadLimit = DEFAULT_IMAGE_UPLOAD_LIMIT,
  hiddenTools = [],
  labels,
}: RichTextEditorProps) {
  const resolvedLabels = useMemo(() => {
    const next = resolveLabels(labels)
    return placeholder ? { ...next, placeholder } : next
  }, [labels, placeholder])
  const hiddenToolSet = useMemo(() => new Set(hiddenTools), [hiddenTools])
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>(
    'main'
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastExternalValueRef = useRef(value)

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': resolvedLabels.editorAriaLabel,
        class: 'simple-editor',
        'data-placeholder': resolvedLabels.placeholder,
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ...(uploadImage
        ? [
            ImageUploadNode.configure({
              accept: 'image/*',
              maxSize: maxImageSize,
              limit: imageUploadLimit,
              upload: uploadImage,
              labels: resolvedLabels,
              onError: () => {},
            }),
          ]
        : []),
    ],
    content: value ?? defaultValue ?? '',
    onUpdate: ({ editor }) => {
      emitChange(editor, onChange)
    },
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  useEffect(() => {
    if (!editor || value === undefined || value === lastExternalValueRef.current)
      return

    lastExternalValueRef.current = value
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main')
    }
  }, [isMobile, mobileView])

  return (
    <div
      className={cn('rich-text-editor simple-editor-wrapper', className)}
      style={{
        minHeight: toCssSize(minHeight),
        maxHeight: toCssSize(maxHeight),
      }}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              labels={resolvedLabels}
              hiddenTools={hiddenToolSet}
              canUploadImage={Boolean(uploadImage)}
              isMobile={isMobile}
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              labels={resolvedLabels}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role='presentation'
          className={cn('simple-editor-content', contentClassName)}
        />
      </EditorContext.Provider>
    </div>
  )
}
