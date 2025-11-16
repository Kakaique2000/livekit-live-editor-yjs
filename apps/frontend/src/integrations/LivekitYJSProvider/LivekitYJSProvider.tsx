import { useRoomContext } from "@livekit/components-react";
import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import { DataPacket_Kind, RemoteParticipant, RoomEvent } from "livekit-client";
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness";
import {
    readSyncMessage,
    writeSyncStep1,
    writeUpdate
} from "y-protocols/sync";

import { useEffect, useRef } from "react";
import * as Y from 'yjs';

export function useLivekitYJSDoc(doc: Y.Doc, topic: string) {

    const room = useRoomContext();

    useEffect(() => {
        if (!room) return;

        const send = (data: Uint8Array) => {
            void room.localParticipant.publishData(data, {
                reliable: true,
                topic,
            });
        };

        const sendSyncStep1 = () => {
            const encoder = encoding.createEncoder();
            writeSyncStep1(encoder, doc);
            send(encoding.toUint8Array(encoder));
        };

        const onLocalUpdate = (update: Uint8Array, origin: unknown) => {
            if (origin === 'remote') return;

            const encoder = encoding.createEncoder();
            writeUpdate(encoder, update);
            send(encoding.toUint8Array(encoder));
        };

        const onRemoteMessage = (
            remotePayload: Uint8Array,
            _participant: RemoteParticipant | undefined,
            _kind: DataPacket_Kind | undefined,
            receivedMessageTopic: string | undefined
        ) => {
            if (receivedMessageTopic !== topic) return;

            const decoder = decoding.createDecoder(remotePayload);
            const encoder = encoding.createEncoder();

            readSyncMessage(decoder, encoder, doc, 'remote');

            if (encoding.length(encoder) > 0) {
                send(encoding.toUint8Array(encoder));
            }
        };

        const onParticipantConnected = () => {
            // When a new participant joins, send them our state after a small delay
            // to ensure they're ready to receive (LiveKit issue #2102)
            setTimeout(sendSyncStep1, 100);
        };

        doc.on("update", onLocalUpdate);
        room.on(RoomEvent.DataReceived, onRemoteMessage);
        room.on(RoomEvent.ParticipantConnected, onParticipantConnected);

        // Send initial sync request after data channels are established
        setTimeout(sendSyncStep1, 500);

        return () => {
            doc.off("update", onLocalUpdate);
            room.off(RoomEvent.DataReceived, onRemoteMessage);
            room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
        };

    }, [doc, room, topic]);

    return doc;
}

export function useLivekitAwareness(
    awareness: Awareness,
    topic: string
) {
    const room = useRoomContext();
    // Map participant identity to their awareness clientID
    const participantToClientId = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (!room) return;

        const onLocalAwarenessUpdate = ({
            added,
            updated,
            removed,
        }: {
            added: number[];
            updated: number[];
            removed: number[];
        }) => {
            const changed = added.concat(updated, removed);
            if (!changed.length) return;

            const update = encodeAwarenessUpdate(awareness, changed);

            void room.localParticipant.publishData(update, {
                reliable: false,
                topic,
            });
        };

        const onRemoteAwarenessUpdate = (
            payload: Uint8Array,
            participant: RemoteParticipant | undefined,
            _kind: DataPacket_Kind | undefined,
            receivedTopic: string | undefined
        ) => {
            if (receivedTopic !== topic) return;

            // Track which clientID belongs to which participant
            const statesBefore = new Set(awareness.getStates().keys());

            applyAwarenessUpdate(
                awareness,
                payload,
                participant?.identity
            );

            // Find new clientIDs and map them to participant
            if (participant) {
                const statesAfter = awareness.getStates().keys();
                for (const clientId of statesAfter) {
                    if (!statesBefore.has(clientId) && clientId !== awareness.clientID) {
                        participantToClientId.current.set(participant.identity, clientId);
                    }
                }
            }
        };

        const onParticipantDisconnected = (participant: RemoteParticipant) => {
            const clientId = participantToClientId.current.get(participant.identity);
            if (clientId !== undefined) {
                removeAwarenessStates(awareness, [clientId], 'disconnect');
                participantToClientId.current.delete(participant.identity);
            }
        };

        awareness.on("update", onLocalAwarenessUpdate);
        room.on(RoomEvent.DataReceived, onRemoteAwarenessUpdate);
        room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

        return () => {
            awareness.off("update", onLocalAwarenessUpdate);
            room.off(RoomEvent.DataReceived, onRemoteAwarenessUpdate);
            room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
        };
    }, [awareness, room, topic]);
}