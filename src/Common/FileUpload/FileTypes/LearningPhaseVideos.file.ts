import { IFile } from "./IFile";
import { IFileTypes } from "./Types/IFileTypes";
import { VideosFileType } from "./Types/Videos.filetypes";

class LearningPhaseVideosFile implements IFile
{
    MaxSize: number = 1024 * 1024 * 500;

    Dest: string = "/learning/videos/";

    FileType: IFileTypes = new VideosFileType();
}

export const LearningPhaseVideosFileOptions =  new LearningPhaseVideosFile();