import type { observer as distObserver } from 'mobx-react-lite/dist/observer'
// @ts-expect-error workaround as mobx-react is expecting react-dom which isn't
// available here, in the Ink renderer environment.
import { observer as libraryObserver } from 'mobx-react-lite/lib/observer'

type Observer = typeof distObserver

export const observer: Observer = libraryObserver
