/** `edit-message` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'edit-message'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'edit.tail': '编辑上一条消息',
}

/** English dictionary (same key set). */
export const en: Record<EditMessageKey, string> = {
  'edit.tail': 'Edit last message',
}

/** Union of this namespace's dictionary keys. */
export type EditMessageKey = keyof typeof zh
