import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css' // Import Excalidraw styles
import {
  useLocalParticipant,
  useParticipantInfo,
} from '@livekit/components-react'
import React, { useEffect } from 'react'
import { ExcalidrawBinding, yjsToExcalidraw } from 'y-excalidraw'
import { Awareness } from 'y-protocols/awareness.js'
import * as Y from 'yjs'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { pickFromArrayBySeed } from '@/lib/random'
import {
  useLivekitAwareness,
  useLivekitYJSDoc,
} from '@/integrations/LivekitYJSProvider/LivekitYJSProvider'

const excalidrawDoc = new Y.Doc()
const yElements = excalidrawDoc.getArray<Y.Map<any>>('elements')
const ExcalidrawAwareness = new Awareness(excalidrawDoc)
const yAssets = excalidrawDoc.getMap('assets')

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' },
]

export default function ExcalidrawComponent() {
  const [api, setApi] = React.useState<ExcalidrawImperativeAPI | null>(null)
  const excalidrawRef = React.useRef<HTMLDivElement | null>(null)
  const [binding, setBindings] = React.useState<ExcalidrawBinding | null>(null)

  useLivekitYJSDoc(excalidrawDoc, 'yjs-excalidraw')
  useLivekitAwareness(ExcalidrawAwareness, 'yjs-excalidraw-awareness')

  const { localParticipant } = useLocalParticipant()
  const participantInfo = useParticipantInfo({ participant: localParticipant })

  useEffect(() => {
    const color = pickFromArrayBySeed(
      participantInfo.identity ?? '',
      usercolors,
    )
    console.debug('Setting local state field for user', participantInfo, color)
    ExcalidrawAwareness.setLocalStateField('user', {
      name: participantInfo.name ?? '',
      color: color.color,
      light: color.light,
    })
  }, [participantInfo])

  useEffect(() => {
    if (!api || !excalidrawRef.current) return

    const binding = new ExcalidrawBinding(
      yElements,
      yAssets,
      api,
      ExcalidrawAwareness,
      // excalidraw dom is needed to override the undo/redo buttons in the UI as there is no way to override it via props in excalidraw
      // You might need to pass {trackedOrigins: new Set()} to undomanager depending on whether your provider sets an origin or not
      {
        excalidrawDom: excalidrawRef.current,
        undoManager: new Y.UndoManager(yElements),
      },
    )
    setBindings(binding)
    return () => {
      setBindings(null)
      binding.destroy()
    }
  }, [api])

  const initData = {
    elements: yjsToExcalidraw(yElements),
  }

  return (
    <div className="h-full w-full" ref={excalidrawRef}>
      <Excalidraw
        initialData={initData}
        excalidrawAPI={setApi}
        onPointerUpdate={binding?.onPointerUpdate}
        theme="dark"
      />
    </div>
  )
}
