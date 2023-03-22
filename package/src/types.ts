export const vividDataAttributePrefix = 'data-vivid'

export type StyleDescriptor = {
  id: string
  css: string
}
export type VividTheme = 'dark' | 'light'
export type VividFont = 'oss' | 'proprietary'
export type VividConfiguration = {
  theme?: VividTheme
  font?: VividFont
}