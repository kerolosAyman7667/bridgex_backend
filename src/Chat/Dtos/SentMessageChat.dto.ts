import { MessagesDto } from "src/Common/Channels/Dtos/Messages.dto";
import { JoinChannelDto } from "./JoinChannel.dto";
import { ThreadDto } from "src/Common/Channels/Dtos/Thread.dto";

export class SentMessageChatDto extends JoinChannelDto
{
    Message:MessagesDto
}

export class ThreadChatDto extends JoinChannelDto
{
    Thread:ThreadDto
}

export class DeletedChatDto extends SentMessageChatDto
{
}