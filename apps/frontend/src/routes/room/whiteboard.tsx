import ExcalidrawComponent from '@/components/live/Excalidraw';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/room/whiteboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="flex-1 w-full"> <ExcalidrawComponent /></div>
}
