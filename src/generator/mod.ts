import { ensureDir } from 'https://deno.land/std@0.137.0/fs/ensure_dir.ts'

import * as icons from 'https://icon.resources.vonage.com/latest' assert { type: "json" }
// import api from 'https://esm.sh/@vonage/vivid@latest/vivid.api.json' assert { type: "json" }
import vpkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import { npmPackageName, tagPrefix } from '../consts.ts'
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
  const packageDir = 'package'
  const packageGeneratedSrcDir = `${packageDir}/src/generated`
  const v3Dir = `${packageDir}/v3`
  await ensureDir(packageDir)

  /// package.json
  await Deno.writeFile(
    `${packageDir}/package.json`,
    new TextEncoder().encode(JSON.stringify({
      name: npmPackageName,
      version: crypto.randomUUID(), // TODO: revert to vpkg.version when end local testing
      main: "./dist/index.cjs.js",
      browser: "./dist/index.umd.js",
      module: "./dist/index.es.js",
      types: "./dist/index.d.ts",
      scripts: {
        "build": "vite build"
      },
      devDependencies: {
        "tslib": "2.4.1",
        "typescript": "4.9.4",
        "vite": "4.0.4",
        "vitest": "0.28.5",
        "vite-plugin-dts": "1.7.1"
      }
    }, null, '  '))
  )

  await ensureDir(packageGeneratedSrcDir)
  await Deno.writeFile(
    `${packageGeneratedSrcDir}/consts.ts`,
    new TextEncoder().encode(`export const tagPrefix = '${tagPrefix}'\n`)
  )

  console.log('Generating VueJs components...')
  await enumerateVividElements(
    [IconTypeDecorator],
    async (elementName, componentName, tagName, properties, imports, classDeclaration) => {
      console.log(componentName)
      const componentPackageDir = `${v3Dir}/${componentName}`
      const content = await readTemplate('src/generator/vue.component.template')
      const resultContent = content?.
        replaceAll('<% component-name %>', elementName)
        .replaceAll('<% comment %>', JSON.stringify(classDeclaration, null, ' '))
        .replaceAll('<% imports %>', imports.join('\n'))
        .replaceAll('<% tag %>', tagName)
        .replaceAll('<% tag-prefix %>', tagPrefix)
        .replaceAll('<% props %>', properties.map((x) =>
          `  ${x.name}?: ${x.type?.text};`).join('\n'))
        .replaceAll('<% tag-props %>', properties.map((x) =>
          `    :${x.name}="${x.name}"`).join('\n'))
      await ensureDir(componentPackageDir)
      await Deno.writeFile(
        `${componentPackageDir}/package.json`,
        new TextEncoder().encode(JSON.stringify({
          name: `${npmPackageName}-${tagName}`,
          version: vpkg.version,
          main: 'index.vue',
          dependencies: {
            '@vonage/vivid': vpkg.version
          }
        }, null, ' '))
      )
      await Deno.writeFile(
        `${componentPackageDir}/index.vue`,
        new TextEncoder().encode(resultContent)
      )
    }
  )

  const typesContent = `export type IconId = ${((icons as Record<string, unknown>).default as IconDescriptor[]).map(({ id }) => `'${id}'`).join('\n | ')}`
  await Deno.writeFile(
    `${packageGeneratedSrcDir}/types.ts`,
    new TextEncoder().encode(typesContent)
  )
}