export type RichTextEditorTool =
  | 'undo'
  | 'redo'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeBlock'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'underline'
  | 'highlight'
  | 'link'
  | 'superscript'
  | 'subscript'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'imageUpload'

export interface RichTextEditorLabels {
  editorAriaLabel: string
  placeholder: string
  undo: string
  redo: string
  heading: string
  headingLevel: (level: number) => string
  bulletList: string
  orderedList: string
  taskList: string
  blockquote: string
  codeBlock: string
  bold: string
  italic: string
  strike: string
  code: string
  underline: string
  highlight: string
  highlightColors: string
  removeHighlight: string
  highlightColor: (label: string) => string
  link: string
  linkPlaceholder: string
  applyLink: string
  openLink: string
  removeLink: string
  superscript: string
  subscript: string
  alignLeft: string
  alignCenter: string
  alignRight: string
  alignJustify: string
  imageUpload: string
  imageUploadDrop: string
  imageUploadHint: (limit: number, maxSize: number) => string
  imageUploading: (count: number) => string
  imageClearAll: string
  imageRemove: string
  uploadNoFile: string
  uploadNotConfigured: string
  uploadNoUrl: string
  uploadFailed: string
  uploadCancelled: string
  uploadTooLarge: (maxSize: number) => string
  uploadTooMany: (limit: number) => string
}

export const zhCNLabels: RichTextEditorLabels = {
  editorAriaLabel: '正文编辑区域，开始输入内容。',
  placeholder: '请输入内容',
  undo: '撤销',
  redo: '重做',
  heading: '标题',
  headingLevel: (level) => `标题 ${level}`,
  bulletList: '无序列表',
  orderedList: '有序列表',
  taskList: '任务列表',
  blockquote: '引用',
  codeBlock: '代码块',
  bold: '加粗',
  italic: '斜体',
  strike: '删除线',
  code: '行内代码',
  underline: '下划线',
  highlight: '高亮',
  highlightColors: '高亮颜色',
  removeHighlight: '清除高亮',
  highlightColor: (label) => `${label}高亮`,
  link: '链接',
  linkPlaceholder: '粘贴链接...',
  applyLink: '应用链接',
  openLink: '在新窗口打开',
  removeLink: '移除链接',
  superscript: '上标',
  subscript: '下标',
  alignLeft: '左对齐',
  alignCenter: '居中对齐',
  alignRight: '右对齐',
  alignJustify: '两端对齐',
  imageUpload: '添加图片',
  imageUploadDrop: '点击上传或拖拽图片到这里',
  imageUploadHint: (limit, maxSize) =>
    `最多 ${limit} 个文件，每个不超过 ${maxSize / 1024 / 1024}MB。`,
  imageUploading: (count) => `正在上传 ${count} 个文件`,
  imageClearAll: '全部清除',
  imageRemove: '移除文件',
  uploadNoFile: '未选择文件',
  uploadNotConfigured: '未配置图片上传函数',
  uploadNoUrl: '上传失败：未返回图片地址',
  uploadFailed: '上传失败',
  uploadCancelled: '上传已取消',
  uploadTooLarge: (maxSize) =>
    `文件大小超过限制（${maxSize / 1024 / 1024}MB）`,
  uploadTooMany: (limit) => `最多只能上传 ${limit} 个文件`,
}

export function resolveLabels(
  labels?: Partial<RichTextEditorLabels>
): RichTextEditorLabels {
  return { ...zhCNLabels, ...labels }
}
