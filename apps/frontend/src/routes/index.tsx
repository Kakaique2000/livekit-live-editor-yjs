import { SyncedBasicEditor } from '@/components/live/SyncedBasicText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLivekitToken } from '@/lib/mutations';
import { LiveKitRoom } from '@livekit/components-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {

  const [name, setName] = useState('')

  const { mutate: getLivekitToken, data, isPending, error, isError } = useLivekitToken();

  const serverUrl = import.meta.env.VITE_LIVEKIT_SERVER_URL;

  if (!serverUrl) {
    return <div>Server URL is not set</div>;
  }

  if (isPending) return <div>Loading...</div>;
  if (!data) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); getLivekitToken(name) }} className="flex flex-col gap-2 border px-4 py-2 rounded-md w-sm mx-auto mt-10">
        <label htmlFor="name">Insert your name</label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => getLivekitToken(name)}>Get Livekit Token</Button>
        {isError && <div>Error: {error.message}</div>}
      </form>
    )
  }


  return (
    <div>

      <LiveKitRoom audio={true} video={true} token={data.token} serverUrl={serverUrl}>
        <SyncedBasicEditor />
      </LiveKitRoom>

    </div>
  )
}
