import { ensureDir } from 'https://deno.land/std@0.137.0/fs/ensure_dir.ts'

// import api from 'https://esm.sh/@vonage/vivid@latest/vivid.api.json' assert { type: "json" }
import vpkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import { markdownFolder, npmPackageName, tagPrefix, versionFile } from '../consts.ts'
import { enumerateVividElements, getElementRegistrationFunctionName } from './custom.elements.ts'
import { CssPropertiesDecorator } from './decorators/css.properties.decorator.ts'
import { EventsDecorator } from './decorators/events.decorator.ts'
import { IconTypeDecorator } from './decorators/icon.type.decorator.ts'
import { ImportsDecorator } from './decorators/imports.decorator.ts'
import { PropertiesDecorator } from './decorators/properties.decorator.ts'
import { PublicMethodsDecorator } from './decorators/public.methods.decorator.ts'
import { PublicPropertiesDecorator } from './decorators/public.properties.decorator.ts'
import { SlotsDecorator } from './decorators/slots.decorator.ts'
import { StylePropertyDecorator } from './decorators/style.property.decorator.ts'
import { TypeDeclarationsMap, AsyncClassMethod } from './decorators/types.ts'
import { fillPlaceholders, readTemplate } from './utils.ts'

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
      version: vpkg.version,
      main: "./dist/index.cjs.js",
      browser: "./dist/index.umd.js",
      module: "./dist/index.es.js",
      types: "./dist/index.d.ts",
      repository: {
        "type": "git",
        "url": "https://github.com/Vonage/vivid-bindings-vue"
      },
      license: "Apache-2.0",
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
        "vite": "4.1.4",
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
    [
      PublicPropertiesDecorator,
      PublicMethodsDecorator,
      CssPropertiesDecorator,
      SlotsDecorator,
      PropertiesDecorator,
      EventsDecorator,
      IconTypeDecorator,
      StylePropertyDecorator,
      ImportsDecorator
    ],
    async ({ vueComponentName, tagName, properties, methods, events, slots, imports, typeDeclarations, classDeclaration }) => {
      console.log(vueComponentName)
      elementsTypeDeclarations = { ...elementsTypeDeclarations, ...typeDeclarations }
      const componentPackageDir = `${v3Dir}/${vueComponentName}`
      const content = await readTemplate('src/generator/vue.component.template')
      const resultContent = fillPlaceholders(content)({
        componentRegisterMethod: getElementRegistrationFunctionName(classDeclaration),
        jsonModel: JSON.stringify(classDeclaration, null, ' '),
        componentJsdoc: classDeclaration.description ? `<!-- ${classDeclaration.description} -->` : '',
        imports: imports.join('\n'),
        tagName,
        slot: slots.length > 0 ? `<slot />` : '',
        tagPrefix,
        methods: methods.length > 0 ? `\nconst element = ref<HTMLElement | null>(null)\ndefineExpose({\n${methods.map((method) => `  ${method.name}: ${(method as AsyncClassMethod).async ? 'async ' : ''}(${method.parameters && method.parameters.length > 0 ? method.parameters.map(({ name, type }) => `${name}: ${type?.text || 'unknown'}`).join(', ') : ''})${method.return ? `: ${method.return.type?.text}` : ''} => (element.value as any)?.${method.name}(${method.parameters && method.parameters.length > 0 ? method.parameters.map(({ name }) => `${name}`).join(', ') : ''})`).join(',\n')}\n});` : '',
        events: events.length > 0 ? `\ndefineEmits<{\n${events.map(x => `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''}(event: '${x.name}', payload: ${x.type.text}): void`).join('\n')}\n}>();` : '',
        props: properties.length > 0 ? `defineProps<{\n${properties.map((x) =>
          `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''}${x.name}?: ${x.type?.text};`).join('\n')}\n}>();` : '',
        tagProps: [
          ...(methods.length > 0 ? ['    ref="element"'] : []),
          ...properties.map((x) => `    :${x.name}="${x.name}"`),
          ...events.map((x) => `    @${x.name}="$emit('${x.name}', $event)"`)
        ].join('\n')
      })
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