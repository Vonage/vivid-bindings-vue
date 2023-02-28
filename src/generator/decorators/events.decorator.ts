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
    ]
  }

  decorateEvents = (events: Event[]) =>
    [
      ...events,
      ...(this.extraEventsMap[this.className] ?? [])
    ]
}