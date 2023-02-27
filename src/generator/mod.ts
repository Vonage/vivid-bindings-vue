import { ensureDir } from 'https://deno.land/std@0.137.0/fs/ensure_dir.ts'

// import api from 'https://esm.sh/@vonage/vivid@latest/vivid.api.json' assert { type: "json" }
import vpkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import { markdownFolder, npmPackageName, tagPrefix, versionFile } from '../consts.ts'
import { enumerateVividElements } from './custom.elements.ts'
import { EventsDecorator } from './decorators/events.decorator.ts'
import { IconTypeDecorator } from './decorators/icon.type.decorator.ts'
import { TypeDeclarationsMap } from './decorators/types.ts'

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
      dependencies: {
        "@vonage/vivid": "latest",
        "vue": "3.2.47"
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
  let elementsTypeDeclarations: TypeDeclarationsMap = {}
  await enumerateVividElements(
    [EventsDecorator, IconTypeDecorator],
    async (elementName, componentName, tagName, properties, events, imports, typeDeclarations, classDeclaration) => {
      console.log(componentName)
      elementsTypeDeclarations = { ...elementsTypeDeclarations, ...typeDeclarations }
      const componentPackageDir = `${v3Dir}/${componentName}`
      const content = await readTemplate('src/generator/vue.component.template')
      const resultContent = content?.
        replaceAll('<% component-name %>', elementName)
        .replaceAll('<% comment %>', JSON.stringify(classDeclaration, null, ' '))
        .replaceAll('<% imports %>', imports.join('\n'))
        .replaceAll('<% tag %>', tagName)
        .replaceAll('<% tag-prefix %>', tagPrefix)
        .replaceAll('<% events %>', events.map(x => `  (event: '${x.name}', payload: ${x.type.text}): void`).join('\n'))
        .replaceAll('<% props %>', properties.map((x) =>
          `  ${x.name}?: ${x.type?.text};`).join('\n'))
        .replaceAll('<% tag-props %>',
          [
            ...properties.map((x) => `    :${x.name}="${x.name}"`),
            ...events.map((x) => `    @${x.name}="$emit('${x.name}', $event)"`)
          ].join('\n'))
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

  await Deno.writeFile(
    `${packageGeneratedSrcDir}/types.ts`,
    new TextEncoder().encode(Object.entries(elementsTypeDeclarations)
      .map(([name, { declaration }]) => `export type ${name} = ${declaration}`).join('\n'))
  )

  for await (const stylesFile of [
    { name: 'core.all', url: 'https://unpkg.com/@vonage/vivid@latest/styles/core/all.css' },
    { name: 'theme.light', url: 'https://unpkg.com/@vonage/vivid@latest/styles/tokens/theme-light.css' },
    { name: 'theme.dark', url: 'https://unpkg.com/@vonage/vivid@latest/styles/tokens/theme-dark.css' }
  ]) {
    const response = await fetch(stylesFile.url)
    const cssText = await response.text()
    await Deno.writeFile(
      `${packageGeneratedSrcDir}/style.${stylesFile.name}.ts`,
      new TextEncoder().encode(`export default { id: '${stylesFile.name}', css: \`${cssText}\`}`)
    )
  }

  // write actual version as handled
  await ensureDir(markdownFolder)
  await Deno.writeFile(versionFile, new TextEncoder().encode(vpkg.version))
}