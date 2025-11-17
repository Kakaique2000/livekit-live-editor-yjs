import { ParticipantLoop, ParticipantName, useParticipants } from "@livekit/components-react";


export default function ParticipantList() {
    const participants = useParticipants();

    return (
        <ParticipantLoop participants={participants}>
            <ParticipantName />
        </ParticipantLoop>
    )
}