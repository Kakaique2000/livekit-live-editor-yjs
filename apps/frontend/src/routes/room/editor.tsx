import { SyncedBasicEditor } from '@/components/live/SyncedBasicText'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/room/editor')({
  component: RouteComponent,

})

function RouteComponent() {
  return <SyncedBasicEditor />
}
