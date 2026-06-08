# @huangchangxin2/tiptap-rich-text-editor

## 项目简介

`@huangchangxin2/tiptap-rich-text-editor` 是一个基于 Tiptap 和 Tiptap UI Simple Editor 抽取的 React 富文本编辑器组件。它内置中文工具栏文案、链接弹窗、图片上传入口和移动端工具栏适配，适合在后台管理、内容发布、表单编辑等场景中快速接入富文本能力。

组件会在内容变化时返回常用数据格式，包括 `html`、`json` 和 `text`。包内只导出编辑器组件、中文文案和相关 TypeScript 类型，样式通过独立的 `style.css` 子路径引入。

## 使用方式

安装组件包：

```bash
pnpm add @huangchangxin2/tiptap-rich-text-editor
```

业务项目需要提供 React。如果项目还没有安装 React，请先安装：

```bash
pnpm add react react-dom
```

在页面或应用入口中引入组件和样式：

```tsx
import { RichTextEditor } from '@huangchangxin2/tiptap-rich-text-editor'
import '@huangchangxin2/tiptap-rich-text-editor/style.css'

export function EditorDemo() {
  return (
    <RichTextEditor
      placeholder="请输入内容"
      onChange={({ html, json, text }) => {
        console.log(html, json, text)
      }}
    />
  )
}
```

需要受控内容时，使用 `value` 和 `onChange`。`value` 支持 HTML 字符串和 Tiptap `JSONContent`：

```tsx
import { useState } from 'react'
import { RichTextEditor } from '@huangchangxin2/tiptap-rich-text-editor'
import type { JSONContent } from '@huangchangxin2/tiptap-rich-text-editor'
import '@huangchangxin2/tiptap-rich-text-editor/style.css'

export function ControlledEditor() {
  const [content, setContent] = useState<JSONContent>({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '这是一段初始内容。' }],
      },
    ],
  })

  return (
    <RichTextEditor
      value={content}
      onChange={({ json }) => {
        setContent(json)
      }}
    />
  )
}
```

只需要初始化一次内容时，使用 `defaultValue`：

```tsx
<RichTextEditor
  defaultValue="<p>欢迎使用富文本编辑器。</p>"
  onChange={({ html }) => {
    console.log(html)
  }}
/>
```

传入 `uploadImage` 后，工具栏会显示图片上传按钮。上传函数需要返回图片 URL：

```tsx
<RichTextEditor
  maxImageSize={5 * 1024 * 1024}
  imageUploadLimit={3}
  uploadImage={async (file, onProgress, abortSignal) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: abortSignal,
    })

    if (!response.ok) {
      throw new Error('图片上传失败')
    }

    onProgress?.({ progress: 100 })

    const result = await response.json()
    return result.url
  }}
/>
```

可以使用 `hiddenTools` 隐藏工具栏按钮，使用 `labels` 覆盖默认中文文案：

```tsx
<RichTextEditor
  hiddenTools={['codeBlock', 'taskList', 'imageUpload']}
  labels={{
    placeholder: '写点什么...',
    linkPlaceholder: '输入链接地址...',
    imageUpload: '上传图片',
  }}
/>
```

可以使用 `editable`、`minHeight`、`maxHeight`、`className` 和 `contentClassName` 控制编辑器状态与样式：

```tsx
<RichTextEditor
  editable={false}
  minHeight={240}
  maxHeight="70vh"
  className="my-editor"
  contentClassName="my-editor-content"
/>
```

在 Next.js App Router 中，请从 client component 中使用：

```tsx
'use client'

import { RichTextEditor } from '@huangchangxin2/tiptap-rich-text-editor'
import '@huangchangxin2/tiptap-rich-text-editor/style.css'

export default function PageEditor() {
  return <RichTextEditor />
}
```
