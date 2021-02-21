import { observer as distObserver } from 'mobx-react-lite/dist/observer'
// @ts-expect-error workaround as mobx-react is expecting react-dom
import { observer as libraryObserver } from 'mobx-react-lite/lib/observer'

type Observer = typeof distObserver

export const observer: Observer = libraryObserver
