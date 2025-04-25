import { IFileTypes } from "./IFileTypes";

export class VideosFileType implements IFileTypes {
    Extensions: string[] = ['mp4', 'm4v', "wmv", "asf"];

    MimeTypes: string[] = ['video/mp4', 'video/x-m4v', 'video/x-ms-wmv', "audio/x-ms-asf"];
}