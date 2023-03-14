const deCapitalize = (input: string) => input.replace(/(^|\s)[A-Z]/g, s => s.toLowerCase())
export const camel2kebab = (input: string) => deCapitalize(input).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, '-').toLowerCase()
export const readTemplate = async (
  name = ''
): Promise<string | undefined> => {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(await Deno.readFile(name))
}
export const fillPlaceholders = (input?: string) => (substitutions: Record<string, string>) =>
  Object.entries(substitutions).reduce((input, [key, value]) => (input || '').replaceAll(`<%= ${key} %>`, value), input)