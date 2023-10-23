import { ensureDir } from 'https://deno.land/std@0.137.0/fs/ensure_dir.ts'

import vpkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import vbpkg from 'https://esm.sh/@vonage/vivid-bindings-vue@latest/package.json' assert { type: "json" }
import { markdownFolder, npmPackageName, styleDirectiveName, rootDirectiveName, tagPrefix, versionFile, patchModeEnv } from '../consts.ts'
import { enumerateVividElements } from './custom.elements.ts'
import { CssPropertiesDecorator } from './decorators/css.properties.decorator.ts'
import { EventsDecorator } from './decorators/events.decorator.ts'
import { IconTypeDecorator } from './decorators/icon.type.decorator.ts'
import { ImportsDecorator } from './decorators/imports.decorator.ts'
import { PropertiesDecorator } from './decorators/properties.decorator.ts'
import { PublicMethodsDecorator } from './decorators/public.methods.decorator.ts'
import { PublicPropertiesDecorator } from './decorators/public.properties.decorator.ts'
import { SlotsDecorator } from './decorators/slots.decorator.ts'
import { StylePropertyDecorator } from './decorators/style.property.decorator.ts'
import { renderVividVueComponent } from './render.vue.component.ts'
import { fillPlaceholders } from './utils.ts'
import { AnchorTypeDecorator } from './decorators/anchortype.decorator.ts'

/**
 * Enumerates all valid Vivid custom elements and generates the output to the `./package` folder
 * The output consists of
 *  - `./package/src/generated`  (generated typescript files)
 *  - `./package/v3` (generated Vuejs3 components as bindings for Vivid3 in the SFC format https://vuejs.org/api/sfc-spec.html#overview)
 */
export const generate = async () => {
  const isPatchMode = Deno.env.get(patchModeEnv)
  const packageDir = 'package'
  const templatesFolder = 'src/generator/templates'
  const packageGeneratedSrcDir = `${packageDir}/src/generated`
  const v3Dir = `${packageDir}/v3`
  await ensureDir(packageDir)

  await Deno.writeFile(
    `${packageDir}/package.json`,
    new TextEncoder().encode(
      await fillPlaceholders(`${templatesFolder}/root.package.json.template`)({
        npmPackageName,
        npmPackageVersion: isPatchMode ? vbpkg.version : vpkg.version,
        vividPackageVersion: vpkg.version
      })
    )
  )

  await ensureDir(packageGeneratedSrcDir)
  // pass Deno TS consts to the Web TS package
  await Deno.writeFile(
    `${packageGeneratedSrcDir}/consts.ts`,
    new TextEncoder().encode(
      Object.entries({
        tagPrefix,
        styleDirectiveName,
        rootDirectiveName,
        vividVersion: vpkg.version
      }).map(([key, value]) => `export const ${key} = '${value}'`).join('\n')
    )
  )

  const { typeDeclarations } = await enumerateVividElements(
    [
      PublicPropertiesDecorator,
      PublicMethodsDecorator,
      CssPropertiesDecorator,
      SlotsDecorator,
      PropertiesDecorator,
      AnchorTypeDecorator,
      EventsDecorator,
      IconTypeDecorator,
      StylePropertyDecorator,
      ImportsDecorator
    ],
    async ({ vueComponentName, tagName, properties, methods, events, slots, imports,
      classDeclaration, vividElementDocUrl, vueModel }) => {
      console.log(vueComponentName)
      const componentPackageDir = `${v3Dir}/${vueComponentName}`
      await ensureDir(componentPackageDir)
      await Deno.writeFile(
        `${componentPackageDir}/definition.json`,
        new TextEncoder().encode(JSON.stringify(classDeclaration, null, ' '))
      )
      await Deno.writeFile(
        `${componentPackageDir}/package.json`,
        new TextEncoder().encode(
          await fillPlaceholders(`${templatesFolder}/component.package.json.template`)({
            npmPackageName: `${npmPackageName}-${tagName}`,
            vividPackageVersion: vpkg.version,
            vueComponentName,
            vividElementDocUrl
          })
        )
      )
      await Deno.writeFile(
        `${componentPackageDir}/${vueComponentName}.vue`,
        new TextEncoder().encode(await renderVividVueComponent(`${templatesFolder}/vue.component.template`, {
          properties, methods, events, slots, imports, tagName, tagPrefix, classDeclaration, vividElementDocUrl, vueModel, vueComponentName
        }))
      )
    }
  )

  await Deno.writeFile(
    `${packageGeneratedSrcDir}/types.ts`,
    new TextEncoder().encode(Object.entries(typeDeclarations)
      .map(([name, { specifier, assignment, declaration, description }]) => `/**\n*  ${description}\n*/\nexport ${[specifier, name, assignment].filter(Boolean).join(' ')} ${declaration.text}`).join('\n'))
  )

  for (const stylesFile of [
    { name: 'core.all', url: 'https://unpkg.com/@vonage/vivid@latest/styles/core/all.css' },
    { name: 'theme.light', url: 'https://unpkg.com/@vonage/vivid@latest/styles/tokens/theme-light.css' },
    { name: 'theme.dark', url: 'https://unpkg.com/@vonage/vivid@latest/styles/tokens/theme-dark.css' }
  ]) {
    const response = await fetch(stylesFile.url)
    const cssText = (await response.text()).replace(/\/\*# sourceMappingURL=.*\*\//g, '')
    await Deno.writeFile(
      `${packageGeneratedSrcDir}/style.${stylesFile.name}.ts`,
      new TextEncoder().encode(`export default { id: '${stylesFile.name}', css: \`${cssText}\`}`)
    )
  }

  // write actual version as handled
  await ensureDir(markdownFolder)
  await Deno.writeFile(versionFile, new TextEncoder().encode(vpkg.version))
}