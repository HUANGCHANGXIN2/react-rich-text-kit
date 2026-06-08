# @huangchangxin2/tiptap-rich-text-editor

一个基于 Tiptap UI Simple Editor 抽取的通用富文本编辑器包，默认中文化工具栏提示、链接弹窗、图片上传文案和编辑区域描述。

## 安装

```bash
pnpm add @huangchangxin2/tiptap-rich-text-editor
```

私有 GitHub Packages 使用：

```ini
@huangchangxin2:registry=https://npm.pkg.github.com
```

## 使用

```tsx
import { RichTextEditor } from '@huangchangxin2/tiptap-rich-text-editor'
import '@huangchangxin2/tiptap-rich-text-editor/style.css'

export function Demo() {
  return (
    <RichTextEditor
      placeholder="请输入内容"
      onChange={({ html, json, text }) => {
        // 保存 html/json/text
      }}
    />
  )
}
```

## 图片上传

只有传入 `uploadImage` 时才会显示图片上传按钮。

```tsx
<RichTextEditor
  uploadImage={async (file, onProgress, abortSignal) => {
    // 上传文件并返回图片 URL
    return '/uploads/example.jpg'
  }}
/>
```

## 说明

此包基于 Tiptap UI Components 的开源模板源码维护，不是官方 Tiptap 包。
