import { ClassMethod, ClassField, Event } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getElementRegistrationFunctionName, IVividElementsContext, IVividElementVisitorContext } from './custom.elements.ts'
import { AsyncClassMethod, InlineClassMethod } from './decorators/types.ts'
import { fillPlaceholders } from './utils.ts'

const renderMethods = (methods: ClassMethod[]): string =>
  methods.length > 0 ? (
    `\nconst element = ref<HTMLElement | null>(null)\n` +
    `defineExpose({\n${methods.map((method) =>
      `  ${method.description ? `/**\n  *  ${method.description}\n  */\n  ` : ''}${method.name
      }: ${(method as AsyncClassMethod).async ? 'async ' : ''}(${method.parameters && method.parameters.length > 0
        ? method.parameters
          .map(
            ({ name, type }) =>
              `${name}: ${type?.text || 'unknown'}`
          )
          .join(', ')
        : ''
      })${method.return ? `: ${method.return.type?.text}` : ''
      } => ${(method as InlineClassMethod).body ? (method as InlineClassMethod).body :
        `(element.value as any)?.${method.name}(${method.parameters && method.parameters.length > 0
          ? method.parameters.map(({ name }) => `${name}`).join(', ')
          : ''
        })`}`
    )
      .join(',\n')}\n})`
  ) : ''

const renderTagProps = (methods: ClassMethod[], properties: ClassField[], events: Event[]) => {
  const items = [
    ...(methods.length > 0 ? ['    ref="element"'] : []), // to invoke the methods we need a ref to an element
    ...properties.map((x) => `    :${x.name}="${x.name}"`),
    ...events.map((x) => `    @${x.name}="$emit('${x.name}', $event)"`)
  ]
  return items.length > 0 ? items.join('\n') : ''
}

const renderProps = (
  properties: ClassField[]
): string =>
  properties.length > 0
    ? `defineProps<{\n${properties
      .map(
        (x) =>
          `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''
          }${x.name}?: ${x.type ? x.type.text : 'any'}`
      )
      .join('\n')}\n}>()`
    : ''

const renderEvents = (
  events: Event[]
): string =>
  events.length > 0
    ? `\ndefineEmits<{\n${events
      .map(
        (x) =>
          `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''
          }(event: '${x.name}', payload: ${x.type.text}): void`
      )
      .join('\n')}\n}>()`
    : ''

/**
 * Renders Vuejs3 component, using composition API https://vuejs.org/guide/typescript/composition-api.html
 * @param template A .vue component template file path
 * @param context data used to render Vuejs SFC file
 * @returns code content for .vue SFC file https://vuejs.org/api/sfc-spec.html#sfc-syntax-specification
 */
export const renderVividVueComponent = async (template: string,
  { classDeclaration, tagPrefix, tagName, properties, methods, events, slots, imports, vividElementDocUrl }:
    Partial<IVividElementVisitorContext> & IVividElementsContext
) => await fillPlaceholders(template)({
  componentRegisterMethod: getElementRegistrationFunctionName(classDeclaration!),
  vividElementDocUrl: vividElementDocUrl!,
  imports: imports!.join('\n'),
  tagName: tagName!,
  slot: slots!.length > 0 ? `<slot />` : '',
  tagPrefix,
  methods: renderMethods(methods!),
  events: renderEvents(events!),
  props: renderProps(properties!),
  tagProps: renderTagProps(methods!, properties!, events!),
})