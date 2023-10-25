import { ClassMethod, Event, Attribute } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import { getElementRegistrationFunctionName, IVividElementsContext, IVividElementVisitorContext, VueModel } from './custom.elements.ts'
import { AsyncClassMethod, InlineClassMethod } from './decorators/types.ts'
import { fillPlaceholders, kebab2camel } from './utils.ts'

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

const renderTagProps = (methods: ClassMethod[], attributes: Attribute[], events: Event[], vueModel?: VueModel) => {
  const items = [
    ...(methods.length > 0 ? ['    ref="element"'] : []), // to invoke the methods we need a ref to an element
    ...attributes.map((x) => `    :${x.name ?? x.fieldName}="${propName(x)}"`),
    ...events.filter((x) => (vueModel && vueModel.eventName !== x.name) || !vueModel).map((x) => `    @${x.name}="$emit('${x.name}', $event)"`),
    ...(vueModel ? [
      `    :${vueModel.attributeName}="$props.modelValue"`,
      `    @${vueModel.eventName}="$emit('update:modelValue', ${vueModel.valueMapping}); $emit('${vueModel.eventName}', $event)"`
    ] : [])
  ]
  return items.length > 0 ? items.join('\n') : ''
}

const renderProps = (
  attributes: Attribute[],
  vueModel?: VueModel,
  vueComponentName?: string,
): string =>
  attributes.length > 0
    ? `export interface ${vueComponentName}Props {\n${attributes.concat(vueModel ? [{
      name: 'modelValue',
      description: 'v-model property',
      type: {
        text: 'any'
      }
    }] : [])
      .map(
        (x) =>
          `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''
          }${propName(x)}?: ${x.type ? x.type.text : 'any'}`
      )
      .join('\n')}\n}\ndefineProps<${vueComponentName}Props>()`
    : ''

const renderEvents = (
  events: Event[],
  vueModel?: VueModel
): string =>
  (events.length > 0 || vueModel)
    ? `\ndefineEmits<{\n${events.concat(vueModel ? [
      {
        name: 'update:modelValue',
        type: {
          text: 'any'
        }
      },
      {
        name: vueModel.eventName,
        type: {
          text: 'any'
        }
      }
    ] : [])
      .map(
        (x) =>
          `  ${x.description ? `/**\n  * ${x.description}\n  */\n  ` : ''
          }(event: '${x.name}', payload: ${x.type?.text ?? 'Event'}): void`
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
  { classDeclaration, tagPrefix, tagName, attributes, methods, events, slots, imports, vividElementDocUrl, vueModel, vueComponentName }:
    Partial<IVividElementVisitorContext> & IVividElementsContext
) => await fillPlaceholders(template)({
  componentRegisterMethod: getElementRegistrationFunctionName(classDeclaration!),
  vividElementDocUrl: vividElementDocUrl!,
  imports: imports!.join('\n'),
  tagName: tagName!,
  slot: slots!.length > 0 ? `<slot />` : '',
  tagPrefix,
  methods: renderMethods(methods!),
  events: renderEvents(events!, vueModel),
  props: renderProps(attributes!, vueModel, vueComponentName),
  tagProps: renderTagProps(methods!, attributes!, events!, vueModel),
})

const propName = (attr: Attribute): string => kebab2camel(attr.name ?? attr.fieldName)