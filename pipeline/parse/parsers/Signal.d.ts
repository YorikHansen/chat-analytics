// Types for chat dumps from signalexport2json.py (a signalbackup-tools to json converter)
//  with the option --bundle-to-messages

interface SignalAttachment {
    _id: number;
    content_type: string;
    data_size: number;
    file_name: string;
    width: number;
    height: number;
    sticker_emoji: string;
    sticker?: SignalSticker;
}

interface SignalGroups {
    _id: number;
    group_id: number;
    title: string;
}

interface SignalMessage {
    _id: number;
    date_sent: number;
    type: number;
    body: string;
    quote_id: number;
    original_message_id: number;
    attachments: SignalAttachment[];
    thread?: SignalThread;
    from_recipient?: SignalRecipient;
    to_recipient?: SignalRecipient;
    reactions: SignalReaction[];
}

interface SignalReaction {
    _id: number;
    emoji: string;
    author?: SignalRecipient;
}

interface SignalRecipient {
    _id: number;
    e164: string | null;
    username: string | null;
    profile_joined_name: string;
    system_joined_name: string | null;
    groups: SignalGroups[];
}

interface SignalSticker {
    _id: number;
    pack_id: number;
    pack_title: string;
    pack_author: string;
    sticker_id: number;
    emoji: string;
}

interface SignalThread {
    _id: number;
    recipient?: SignalRecipient;
}
