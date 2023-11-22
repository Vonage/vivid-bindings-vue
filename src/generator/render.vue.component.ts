import { ClassMethod, Event, Attribute, Slot, ClassLike } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getClassName, getElementRegistrationFunctionName, IVividElementsContext, IVividElementVisitorContext, VueModel } from './custom.elements.ts'
import { AsyncClassMethod, InlineClassMethod } from './decorators/types.ts'
import { fillPlaceholders, kebab2camel } from './utils.ts'

const renderSlot = (classDeclaration?: ClassLike, slots?: Slot[]): string => {
  const className = classDeclaration ? getClassName(classDeclaration) : undefined
  if (className === 'Icon') {
    return `<slot v-if="props.name === undefined" />`
  }
  return slots && slots.length > 0 ? `<slot />` : ''
}

const propName = (attr: Attribute): string => kebab2camel(attr.name ?? attr.fieldName)

const renderAttributeDefault = (attribute: Attribute): string | undefined => {
  const isString = attribute.type?.text === 'string'
  return isString ? `"${attribute.default !== '\'\'' ? attribute.default : ''}"` : attribute.default
}

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

const renderTagProps = (methods: ClassMethod[], events: Event[], vueModels?: VueModel[]) => {
  const items = [
    ...(methods.length > 0 ? ['    ref="element"'] : []), // to invoke the methods we need a ref to an element
    ...events.filter((x) => (vueModels && !vueModels.find(({ eventName }) => eventName === x.name)) || !vueModels).map((x) => `    @${x.name}="$emit('${x.name}', $event)"`),
    ...(vueModels ? vueModels.flatMap(({ name = 'modelValue', attributeName, eventName, valueMapping }) => [
      `    :${attributeName}="$props.${name}"`,
      `    @${eventName}="$emit('update:${name}', ${valueMapping}); $emit('${eventName}', $event)"`
    ])
      : [])
  ]
  return items.length > 0 ? items.join('\n') : ''
}

const renderProps = (
  attributes: Attribute[],
  vueModels?: VueModel[],
  propsInterfaceName?: string,
): string =>
  attributes.length > 0
    ? `export interface ${propsInterfaceName} {\n${attributes.concat(vueModels ? vueModels.map(({ name = 'modelValue' }) => ({
      name,
      description: 'v-model property',
      type: {
        text: 'any'
      }
    })) : [])
      .map(
        (x) =>
          `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''
          }${propName(x)}?: ${x.type ? x.type.text : 'any'}`
      )
      .join('\n')}\n}\nconst props: ${propsInterfaceName} = withDefaults(defineProps<${propsInterfaceName}>(), {${attributes.filter(x => x.default).map((x) => `${propName(x)}: ${renderAttributeDefault(x)}`).join(',\n')}})`
    : ''

const renderEvents = (
  events: Event[],
  vueModels?: VueModel[]
): string =>
  (events.length > 0 || vueModels)
    ? `\ndefineEmits<{\n${events.concat(vueModels ? [
      ...vueModels.map(({ name = 'modelValue' }) => ({
        name: `update:${name}`,
        type: {
          text: 'any'
        }
      })),
      ...vueModels.map(({ eventName }) => ({
        name: eventName,
        type: {
          text: 'any'
        }
      }))
    ] : [])
      .filter(({ name }, idx, events) =>
        events.filter(x => x.name === name).length === 1 ||
        events.findIndex(x => x.name === name) != idx
      )
      .map(
        ({ name, description, type }) =>
          `  ${description ? `/**\n  * ${description}\n  */\n  ` : ''
          }(event: '${name}', payload: ${type?.text ?? 'Event'}): void`
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
  { classDeclaration, tagPrefix, tagName, attributes, methods, events, slots, imports, vividElementDocUrl, vueModels, vueComponentName }:
    Partial<IVividElementVisitorContext> & IVividElementsContext
) => await fillPlaceholders(template)({
  componentRegisterMethod: getElementRegistrationFunctionName(classDeclaration!),
  vividElementDocUrl: vividElementDocUrl!,
  imports: imports!.join('\n'),
  tagName: tagName!,
  slot: renderSlot(classDeclaration, slots),
  tagPrefix,
  methods: renderMethods(methods!),
  events: renderEvents(events!, vueModels),
  props: renderProps(attributes!, vueModels, `${vueComponentName}Props`),
  tagProps: renderTagProps(methods!, events!, vueModels),
})