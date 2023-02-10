/**
 * Determines if the new version of bindings needs to be generated & auto published as npm package
 *   returns exit code `1` when Vivid has a newer version and there are No corresponding bindings package exists
 *   returns exit code `0` when Vivid latest version equal to the latest bindings package
 */
const { exit } = Deno

enum ResultCode {
  generationIsNeeeded = 1,
  idle = 0
}

import vividPkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }

// import bindingsPkg from 'https://esm.sh/@vonage/vivid-bindings-vue@latest/package.json' assert { type: "json" }
// later on we need to fetch `@vonage/vivid-bindings-vue` npm package version from local git repo
const bindingsPkg = { version: vividPkg.version } // for the time being it reflects Vivid version

const versionsAreEquals = bindingsPkg.version === vividPkg.version
const result = versionsAreEquals ? ResultCode.idle : ResultCode.generationIsNeeeded

console.info(`Vivid latest version is ${vividPkg.version}\nVueJs bindings latest version is ${bindingsPkg.version}`)
console.info(`Resolution: ${result === ResultCode.generationIsNeeeded ? 'Bindings generation is needed' : 'Idle'}`)

exit(result)