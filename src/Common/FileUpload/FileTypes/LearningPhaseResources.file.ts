import { IFile } from "./IFile";
import { IFileTypes } from "./Types/IFileTypes";
import { ResourceFileType } from "./Types/Resource.filetypes";

class LearningPhaseResourcesFile implements IFile
{
    MaxSize: number = 1024 * 1024 * 10;

    Dest: string = "/learning/resources/";

    FileType: IFileTypes = new ResourceFileType();
}

export const LearningPhaseResourcesFileOptions =  new LearningPhaseResourcesFile();