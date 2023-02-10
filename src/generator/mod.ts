import { ensureDir } from 'https://deno.land/std@0.137.0/fs/ensure_dir.ts'

import * as icons from 'https://icon.resources.vonage.com/latest' assert { type: "json" }
// import api from 'https://esm.sh/@vonage/vivid@latest/vivid.api.json' assert { type: "json" }
// import vpkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import { tagPrefix } from '../consts.ts'
import { enumerateVividElements } from './custom.elements.ts'
import { IconTypeDecorator } from './decorators/icon.type.decorator.ts'

interface IconDescriptor {
  id: string
}

const readTemplate = async (
  name = ''
): Promise<string | undefined> => {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(await Deno.readFile(name))
}

export const generate = async () => {
  const outDir = '../vces/packages/my-lib/src/components'
  const indexDir = '../vces/packages/my-lib/src'

  console.log('Generating VueJs components...')
  const indexEntries = [] as string[]
  await enumerateVividElements(
    [IconTypeDecorator],
    async (elementName, componentName, tagName, properties, imports) => {
      console.log(componentName)
      indexEntries.push(`export { default as ${componentName} } from './components/${componentName}.vue';`)
      const content = await readTemplate('src/generator/vue.component.template')
      const resultContent = content?.
        replaceAll('<% component-name %>', elementName)
        .replaceAll('<% imports %>', imports.join('\n'))
        .replaceAll('<% tag %>', tagName)
        .replaceAll('<% tag-prefix %>', tagPrefix)
        .replaceAll('<% props %>', properties.map((x) =>
          `  ${x.name}?: ${x.type?.text};`).join('\n'))
        .replaceAll('<% tag-props %>', properties.map((x) =>
          `    :${x.name}="${x.name}"`).join('\n'))
      await ensureDir(outDir)
      await Deno.writeFile(
        `${outDir}/${componentName}.vue`,
        new TextEncoder().encode(resultContent)
      )
    }
  )

  await Deno.writeFile(
    `${indexDir}/index.ts`,
    new TextEncoder().encode(indexEntries.join('\n'))
  )

  const typesContent = `export type IconId = ${((icons as Record<string, unknown>).default as IconDescriptor[]).map(({ id }) => `'${id}'`).join('\n | ')}`
  await Deno.writeFile(
    `${indexDir}/types.ts`,
    new TextEncoder().encode(typesContent)
  )
}