const deCapitalize = (input: string) => input.replace(/(^|\s)[A-Z]/g, s => s.toLowerCase())
export const camel2kebab = (input: string) => deCapitalize(input).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, '-').toLowerCase()
export const kebab2camel = (input: string) => input.replace(/-([A-Za-z0-9])/g, (_, p1) => p1.toUpperCase())
export const getNthGroupMatch = (
  regExp: RegExp,
  content: string,
  nth = 1
): string => {
  let index = 0
  let result = content
  let regexResult
  do {
    regexResult = regExp.exec(content)
    if (regexResult) {
      result = regexResult[nth]
    }
    index++
  } while (regexResult)
  return result
}
const readTemplate = async (
  name = ''
): Promise<string | undefined> => {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(await Deno.readFile(name))
}
export const fillPlaceholders = (template?: string) => async (substitutions: Record<string, string>) =>
  Object.entries(substitutions).reduce((input, [key, value]) => (input || '').replaceAll(`<%= ${key} %>`, value), await readTemplate(template))