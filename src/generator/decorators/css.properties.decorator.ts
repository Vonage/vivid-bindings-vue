import { CssCustomProperty, CssPart } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  ICssPartsDecorator,
  ICssPropertiesDecorator
} from "./types.ts"

/**
 * Adds missing CSS properties declarations, due to incomplete Vivid elements meta data
 */
export class CssPropertiesDecorator extends AbstractClassDeclarationDecorator implements
  ICssPropertiesDecorator,
  ICssPartsDecorator {

  extraPartsMap: Record<string, CssPart[]> = {
    Header: [
      {
        name: 'base',
        description: 'The component\'s internal header element'
      }
    ],
    SideDrawer: [
      {
        name: 'base',
        description: 'Select base part to access the component\'s internal aside element.'
      }
    ]
  }

  extraPropertiesMap: Record<string, CssCustomProperty[]> = {
    Menu: [
      {
        name: '--menu-max-inline-size',
        description: 'Use the --menu-max-inline-size variable to set the menu\'s inline size.',
        syntax: '<length>',
        default: 'auto'
      },
      {
        name: '--menu-min-inline-size',
        description: 'Use the --menu-min-inline-size variable to set the menu\'s inline size.',
        syntax: '<length>',
        default: 'auto'
      },
    ],
    Tooltip: [
      {
        name: '--tooltip-inline-size',
        description: 'Use the --tooltip-inline-size variable to set the tooltip\'s inline size.',
        syntax: '<number>',
        default: ' 240px'
      }
    ],
    Select: [
      {
        name: '--select-height',
        description: 'If there are many options in the list-box, set a height with the --select-height.',
        syntax: '<string>',
        default: 'fit-content'
      }
    ],
    SideDrawer: [
      {
        name: '--side-drawer-app-content-offset',
        description: 'When side drawer is opened, --side-drawer-app-content-offset controls the offset of the side drawer\'s application content from the window\'s edge. some designs may choose side-drawer to overlap the app-content, so the app-content should be offset by the side-drawer\'s width. Additionally, as aside element (which represents the actual side-drawer), is styled with position: fixed, customizing its inline size directly will not affect the application content offset interchangeably. Hence, using this CSS custom property is mandatory to account for side-drawer inline size altercations.',
        syntax: '<string>',
        default: '280px'
      }
    ],
    Layout: [
      {
        name: '--layout-grid-template-columns',
        description: 'Control the grid-template-columns of the layout by setting --layout-grid-template-columns.',
        syntax: 'repeat(auto-sizing, minmax(column-basis, 1fr))',
        default: 'auto'
      }
    ],
    Header: [
      {
        name: '--vvd-header-block-size',
        description: 'The size of the header block is set definitively. A header\'s block size value is often used in conjunction with other elements in the application. The --vvd-header-block-size private custom property is applied internally to header styles and holds the block size value. This property isn\'t customizable by authors but does pierce in and can be set to apply style to assigned content.',
        syntax: '<length>',
        default: '64px'
      }
    ],
    Card: [
      {
        name: '--headline-line-clamp',
        description: 'The card headline can be trimmed to your preferable number of lines. The number of lines is controlled by the css variable --headline-line-clamp.',
        syntax: '<integer>',
        default: undefined
      },
      {
        name: '--subtitle-line-clamp',
        description: 'The card subtitle can be trimmed to your preferable number of lines. The number of lines is controlled by css variable --subtitle-line-clamp.',
        syntax: '<integer>',
        default: undefined
      }
    ],
    Dialog: [
      {
        name: '--dialog-z-index',
        description: 'When the dialog is not set as modal its initial z-index can be changed if needed.',
        syntax: '<string>',
        default: undefined
      },
      {
        name: '--dialog-min-inline-size',
        description: 'The Dialog has default min-inline-size and max-inline-size. This can be changed with setting a new value. setting the same value for min-inline-size and max-inline-size will set a definitive width to the dialog. When setting a new value for min-inline-size and max-inline-size take in consideration if defendant value are needed for mobile.',
        syntax: '<string>',
        default: undefined
      },
      {
        name: '--dialog-max-inline-size',
        description: 'The Dialog has default min-inline-size and max-inline-size. This can be changed with setting a new value. setting the same value for min-inline-size and max-inline-size will set a definitive width to the dialog. When setting a new value for min-inline-size and max-inline-size take in consideration if defendant value are needed for mobile.',
        syntax: '<string>',
        default: undefined
      },
      {
        name: '--dialog-max-block-size',
        description: 'The Dialog has default max-block-size, if content is larger - there will be scroll.',
        syntax: '<string>',
        default: undefined
      },
    ]
  }

  decorateCSSProperties = (properties: CssCustomProperty[]) =>
    [
      ...properties,
      ...(this.extraPropertiesMap[this.className] ?? [])
    ]

  decorateCSSParts = (parts: CssPart[]) =>
    [
      ...parts,
      ...(this.extraPartsMap[this.className] ?? [])
    ]
}