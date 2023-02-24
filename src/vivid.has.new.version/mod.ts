import vividPkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import { versionFile } from '../consts.ts'

/**
 * Determines if the new version of bindings needs to be generated & auto published as npm package
 *   returns exit code `true` when Vivid has a newer version and there are No corresponding bindings package exists
 *   returns exit code `false` when Vivid latest version equal to the latest bindings package
 */
const { readFileSync } = Deno

const previousVersion = new TextDecoder('utf-8').decode(readFileSync(versionFile))
const bindingsPkg = { version: previousVersion }

const versionsAreEquals = bindingsPkg.version === vividPkg.version

console.info(`Vivid latest version is ${vividPkg.version}\nVueJs bindings latest version is ${bindingsPkg.version}`)
console.info(`Resolution: ${!versionsAreEquals ? 'Bindings generation is needed' : 'Idle'}`)
console.log(`result=${versionsAreEquals}`)