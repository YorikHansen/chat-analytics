import { AttachmentType, getAttachmentTypeFromFileName } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { ChannelType } from "@pipeline/Types";
import { FileInput, streamJSONFromFile, tryToFindTimestampAtEnd } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PCall, PChannel, PEmoji, PMessage, RawID } from "@pipeline/parse/Types";

export class SignalParser extends Parser {
    private conversations: Set<string> = new Set();
    private currentChannelName: string = "";
    private currentChannelIsGroup: boolean = false;

    private channelRegex: RegExp = /^(.+) \((.+)\)\.json$/;

    async *parse(file: FileInput) {
        console.log(file);

        const channelName = this.channelRegex.exec(file.name);
        if (!channelName) {
            throw new Error("Invalid file name");
        }
        this.currentChannelName = channelName[1];
        this.currentChannelIsGroup = channelName[2] === "group";

        const fileBuffer = await file.slice();
        const textContent = new TextDecoder("utf-8").decode(fileBuffer);

        const fileContent = JSON.parse(textContent) as SignalMessage[];

        this.emit("guild", {
            id: 0,
            name: "Signal Chats",
        });

        for (const message of fileContent) {
            console.log(message);
            try {
                this.parseMessage(message);
            } catch (e) {}
        }
    }

    private parseMessage(message: SignalMessage) {
        if (!["incoming", "outgoing"].includes(message.type)) return;

        this.emit("channel", {
            id: message.conversationId,
            guildId: 0,
            name: this.currentChannelName,
            type: this.currentChannelIsGroup ? "group" : "dm",
        });

        if (message.sourceServiceId !== undefined) {
            console.log(message.sourceServiceId);
            this.emit("author", {
                id: message.sourceServiceId,
                name: message.sourceServiceId,
                bot: false,
            });
        } else {
            this.emit("author", {
                id: "you",
                name: "You",
                bot: false,
            });
        }

        let reactions: [PEmoji, number][] | undefined = undefined;
        if (message.reactions !== undefined) {
            reactions = [];
            message.reactions
                .reduce(
                    (emojiMap: Map<string, number>, reaction: SignalReaction) =>
                        emojiMap.set(reaction.emoji, (emojiMap.get(reaction.emoji) || 0) + 1),
                    new Map()
                )
                .forEach((count, emoji) => reactions?.push([{ text: emoji }, count]));
        }

        this.emit("message", {
            id: message.id,
            authorId: message.type === "outgoing" ? "you" : message.sourceServiceId,
            channelId: message.conversationId,
            timestamp: message.timestamp,
            timestampEdit: message.editHistory?.[0].timestamp,
            // timestampEdit?: Timestamp,
            // replyTo?: RawID,

            textContent: message.body,
            // attachments?: AttachmentType[],
            reactions: reactions,
        });
    }
}
