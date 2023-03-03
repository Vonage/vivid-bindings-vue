import { Slot } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  ISlotsDecorator
} from "./types.ts"

/**
 * Adds missing slots declarations, due to incomplete Vivid elements meta data
 */
export class SlotsDecorator extends AbstractClassDeclarationDecorator implements
ISlotsDecorator {

  contentSlot = {
    name: 'content'
  }

  extraSlotsMap: Record<string, Slot[]> = {
    AccordionItem: [
      this.contentSlot
    ],
    Accordion: [
      this.contentSlot
    ],
    ActionGroup: [
      this.contentSlot
    ],
    Avatar: [
      { name: 'graphic' }
    ],
    Banner: [
      { name: 'action-items', description: 'Nodes assigned to action-items slot will be set at the end of the container.' }
    ],
    Card: [
      { name: 'graphic', description: 'The graphic slot overide the icon property' },
      { name: 'media', description: 'The media slot is mainly for images or video content above the card header' },
      { name: 'meta', description: 'The meta slot is for action content in the card header' },
      { name: 'footer', description: 'The footer slot main purpose is for action button' },
      { name: 'main', description: 'Card is battery charged with opinionated template. Assign nodes to main slot to fully override a card\'s predefined flow and style with your own.' },
    ],
    Combobox: [
      this.contentSlot
    ],
    Dialog: [
      { name: 'graphic', description: 'Use the graphic slot in order to replace the icon.' },
      { name: 'body', description: 'Use the body slot in order to add custom HTML to the dialog while enjoying the vivid dialog styling.\n Note that vivid styling comes with opinionated CSS like padding and margin.' },
      { name: 'footer', description: 'Use the footer slot in order to add action buttons to the bottom of the dialog.' },
      { name: 'main', description: 'Dialog is battery charged with an opinionated template. Assign nodes to the main slot to fully override a dialog’s predefined flow and style with your own. Note that all styles will be overridden including the dialog\'s padding. See the example below on how to set padding to a dialog using the main slot.' },
    ],
    Header: [
      { name: 'action-items', description: 'Nodes assigned to action-items slot will be set at the end of the container.' },
      { name: 'app-content', description: 'It is also possible to assign application context directly to the header\'s app-content slot, which will allow content to follow, vertically, the header.' },
    ],
    Layout: [
      this.contentSlot
    ],
    Menu: [
      this.contentSlot
    ],
    Nav: [
      this.contentSlot
    ],
    NavDisclosure: [
      this.contentSlot
    ],
    Note: [
      this.contentSlot
    ],
    RadioGroup: [
      this.contentSlot
    ],
    Select: [
      this.contentSlot
    ],
    SideDrawer: [
      this.contentSlot
    ],
    Tabs: [
      { name: 'tabpanel', description: 'Each tab panel has an associated vwc-tab element, that when activated, displays the tab panel.' }
    ],
    TabPanel: [
      this.contentSlot
    ],
    TreeItem: [
      { name: 'item', description: 'Each tab panel has an associated vwc-tab element, that when activated, displays the tab panel.' }
    ],
    TreeView: [
      this.contentSlot
    ],
  }

  decorateSlots = (slots: Slot[]) =>
    [
      ...slots,
      ...(this.extraSlotsMap[this.className] ?? [])
    ]
}