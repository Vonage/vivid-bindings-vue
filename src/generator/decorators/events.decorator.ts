import { Event } from 'https://esm.sh/custom-elements-manifest@latest/schema.d.ts'
import {
  AbstractClassDeclarationDecorator,
  IEventsDecorator
} from "./types.ts"

/**
 * Adds missing events declarations, due to incomplete Vivid elements meta data
 */
export class EventsDecorator extends AbstractClassDeclarationDecorator implements
  IEventsDecorator {

  extraEventsMap: Record<string, Event[]> = {
    Button: [
      {
        name: 'click',
        type: {
          text: 'PointerEvent'
        }
      }
    ],
    Banner: [
      {
        name: 'removing',
        description: 'Fires removing whenever the banner has started its removing animation.',
        type: {
          text: 'CustomEvent'
        }
      },
      {
        name: 'removed',
        description: 'Fires removed when the removing animation is done.',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
    DataGrid: [
      {
        name: 'row-focused',
        description: 'Fires when a row is focused.',
        type: {
          text: 'CustomEvent'
        }
      },
      {
        name: 'cell-focused',
        description: 'Fires when a cell is focused.',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
    Dialog: [
      {
        name: 'close',
        description: 'The close event fires when the dialog closes (either via user interaction or via the API). It returns the return value inside the event\'s details property.',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
    MenuItem: [
      {
        name: 'expanded-change',
        description: 'Fires a custom \'expanded-change\' event when the expanded state changes',
        type: {
          text: 'CustomEvent'
        }
      },
      {
        name: 'change',
        description: 'Fires a custom \'change\' event when a non-submenu item with a role of menuitemcheckbox, menuitemradio, or menuitem is invoked',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
    SideDrawer: [
      {
        name: 'open',
        description: 'Fires open when the side drawer is opening.',
        type: {
          text: 'CustomEvent'
        }
      },
      {
        name: 'close',
        description: 'Fires close when the side drawer is closing.',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
    Tabs: [
      {
        name: 'change',
        description: 'Fires a custom change event when a tab is clicked or during keyboard navigation.',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
    TreeItem: [
      {
        name: 'expanded-change',
        description: 'Fires a custom \'expanded-change\' event when the expanded state changes.',
        type: {
          text: 'CustomEvent'
        }
      },
      {
        name: 'selected-change',
        description: 'Fires a custom \'selected-change\' event when an item has been selected.',
        type: {
          text: 'CustomEvent'
        }
      }
    ],
  }

  decorateEvents = (events: Event[]) =>
    Object.values([
      ...events,
      ...(this.extraEventsMap[this.className] ?? [])
    ].reduce((eventsMap, event) => ({ ...eventsMap, [event.name]: event }), <Record<string, Event>>{}))
}