export * from './generated/consts'
export * from './generated/types'

import { tagPrefix } from './generated/consts'

export const isCustomElement = (tag: string) => tag.startsWith(`${tagPrefix}-`)

export const initVivid = (app: { _container: any }) => {
  app._container?.classList.add('vvd-root')
}