import { App } from 'vue'

export type StyleDescriptor = {
  id: string
  css: string
}
export type VividTheme = 'dark' | 'light'
export type VividFont = 'oss' | 'proprietary'
export type VividAppConfiguration = {
  theme?: VividTheme
  font?: VividFont
  app: App
}