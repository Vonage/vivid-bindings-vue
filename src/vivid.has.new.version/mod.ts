/**
 * Determines if the new version of bindings needs to be generated & auto published as npm package
 *   returns result code `true` when Vivid has a newer version and there are No corresponding bindings package exists
 *   returns result code `false` when Vivid latest version equal to the latest bindings package
 */

import latestVividPkg from 'https://esm.sh/@vonage/vivid@latest/package.json' assert { type: "json" }
import { versionFile } from '../consts.ts'

const { readFileSync } = Deno

const bindingsPkg = { version: new TextDecoder('utf-8').decode(readFileSync(versionFile)) }

const versionsAreDifferent = bindingsPkg.version !== latestVividPkg.version

console.log(`result=${versionsAreDifferent}`)