// Types for chat dumps from sigtop (https://github.com/tbvdm/sigtop)

interface SignalMessage {
    timestamp: number;
    attachements: []; // Some kind of list
    id: string;
    conversationId: string;
    readStatus: number; // TODO: enum
    received_at: number;
    received_at_ms: number;
    seenStatus: number; // TODO: enum
    sent_at: number;
    serverGuid: string;
    serverTimestamp: number;
    source?: string;
    sourceDevice: number; // TODO: enum
    type: string; // TODO: enum
    unidentifiedDeliveryReceived: boolean;
    schemaVersion: number;
    body: string;
    bodyRanges: []; // Some kind of list
    contact: []; // Some kind of list
    decrypted_at: number;
    errors: []; // Some kind of list
    flags: number; // TODO: enum
    hasAttachments: boolean;
    isViewOnce: boolean;
    mentionsMe: boolean;
    preview: []; // Some kind of list
    requiredProtocolVersion: number;
    supportedVersionAtReceive: number;
    sourceServiceId: string;
    editHistory?: SignalMessage[];
    reactions?: SignalReaction[];
}

interface SignalReaction {
    emoji: string;
    fromId: string;
    targetTimestamp: number;
    timestamp: number;
}
