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
      <div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => getLivekitToken()}>Get Livekit Token</button>
        {isError && <div>Error: {error.message}</div>}
      </div>
    )
  }

  return (
    <div>
      Livekit room:
      <LiveKitRoom audio={true} video={true} token={data.token} serverUrl={serverUrl}>
      </LiveKitRoom>
    </div>
  )
}
