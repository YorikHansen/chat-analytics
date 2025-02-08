import { getAttachmentTypeFromMimeType } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { ChannelType } from "@pipeline/Types";
import { FileInput, streamJSONFromFile } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { PEmoji } from "@pipeline/parse/Types";

export class SignalParser extends Parser {
    private previousMessages: Map<number, number> = new Map<number, number>();

    async *parse(file: FileInput, progress?: Progress) {
        this.emit("guild", {
            id: 0,
            name: "Signal Chats",
        });

        const stream = new JSONStream().onArrayItem<SignalMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file, progress);
    }

    private parseMessage(message: SignalMessage) {
        if (![10485783, 10485780].includes(message.type)) return; // These are ingoing and outgoing messages

        if (message.thread == null || message.from_recipient == null) return;

        let channelName: string = "";
        let channelType: ChannelType = "dm";
        if (message.thread.recipient && message.thread.recipient.groups.length > 0) {
            channelName = message.thread.recipient?.groups[0].title;
            channelType = "group";
        }

        this.emit("channel", {
            id: message.thread._id,
            guildId: 0,
            name: channelName,
            type: channelType,
        });

        let authorName: string = message.from_recipient.system_joined_name ?? "";
        if (authorName.length == 0) {
            authorName = message.from_recipient.profile_joined_name;
            if (message.from_recipient.e164) {
                authorName += ` (${message.from_recipient.e164})`;
            }
        }

        this.emit("author", {
            id: message.from_recipient._id,
            name: authorName,
            bot: false,
        });

        this.previousMessages.set(message._id, message.date_sent);

        let messageId: number = message._id;
        let timestampEdited: number | undefined = undefined;
        if (message.original_message_id) {
            // Editing messages is currently not supported
            messageId = message.original_message_id;
            timestampEdited = message.date_sent;
            return;
        }

        this.emit("message", {
            id: messageId,
            authorId: message.from_recipient._id,
            channelId: message.thread._id,
            timestamp: this.previousMessages.get(message._id) || message.date_sent,
            // timestampEdit: timestampEdited,
            replyTo: message.quote_id,

            textContent: message.body,
            attachments: message.attachments.map((a) => getAttachmentTypeFromMimeType(a.content_type)),
            reactions: message.reactions
                .map((r) => [{ text: r.emoji }, 1] as [PEmoji, number])
                .reduce((acc, [emoji, count]) => {
                    const existing = acc.find(([e]) => e.text === emoji.text);
                    if (existing) {
                        existing[1] += count;
                    } else {
                        acc.push([emoji, count]);
                    }
                    return acc;
                }, [] as [PEmoji, number][]),
        });
    }
}
