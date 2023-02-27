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

  decorateEvents(events: Event[]): Event[] {
    return [
      ...events,
      ...(this.isButtonClass ? [{
        name: 'click',
        type: {
          text: 'PointerEvent'
        }
      }] : [])
    ]
  }

  get isButtonClass() {
    return this.classLike!.name === 'Button'
  }
}