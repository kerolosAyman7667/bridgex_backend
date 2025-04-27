import { BadRequestException, Injectable, Scope, StreamableFile } from "@nestjs/common";
import { IFile } from "./FileTypes/IFile";
import { IFileService } from "./IFile.service";
import { randomBytes } from "crypto";
import { constants, createReadStream, createWriteStream, WriteStream } from "fs";
import * as path from 'path';
import { access, mkdir, unlink } from "fs/promises";
import { FileAlreadyExist } from "./Errors/FileAlreadyExist";
import { FileTypeIsNotAllowed } from "./Errors/FileTypeIsNotAllowed";
import { MaximumFileSizeExceeds } from "./Errors/MaximumFileSizeExceeds";
import { FileNotFound } from "./Errors/FileNotFound";
import { DeleteFileError } from "./Errors/DeleteFileError";
import { FileReturn } from "./FileReturn";
import { UpadeFileError } from "./Errors/UpadeFileError";


let fileTypeFromBuffer: any;
eval(`import('file-type')`).then((module) => {
    fileTypeFromBuffer = module.fileTypeFromBuffer;
});

@Injectable({ scope: Scope.REQUEST })
export class FileService implements IFileService {

    public async Get(filePath: string, fileOptions: IFile): Promise<StreamableFile> {
        if (!filePath)
            throw new FileNotFound("")

        const fullFilePath = path.join("files" , filePath);
        this.IsFileLocationValid(fullFilePath, fileOptions, true)

        const file = createReadStream(fullFilePath);
        return new Promise((resolve, reject) => {
            file.on("error", (err) => {
                reject(new FileNotFound(""))
            })

            file.on("ready", () => {
                resolve(new StreamableFile(file))
            })
        })
    }

    public async Update(
        file: Express.Multer.File,
        filetype: IFile,
        oldFilePath?: string,
        IgnoreUnFoundError?: boolean
    ): Promise<FileReturn> {
        const uploadedNewFile: FileReturn[] = await this.Upload([file], filetype)

        try {
            if (oldFilePath)
                await this.Remove(oldFilePath, filetype, IgnoreUnFoundError);
            if(!IgnoreUnFoundError)
                throw new FileNotFound("Provide the Old file")
        } catch (err) {
            await this.Remove((uploadedNewFile[0]).FilePath, filetype);
            throw new UpadeFileError()
        }

        return uploadedNewFile[0];
    }

    public async Remove(filepath: string, fileOptions: IFile, IgnoreUnFoundError?: boolean): Promise<void> {
        const fullFilePath = path.join("files" , filepath);
        this.IsFileLocationValid(fullFilePath, fileOptions, true)

        try {
            await access(fullFilePath); // Check if file exists
            await unlink(fullFilePath); // Delete file
        } catch (error: any) {
            if (error?.code === 'ENOENT' && !IgnoreUnFoundError) {
                throw new FileNotFound("")
            } else {
                console.error(`Error deleting file: ${error?.message}`);
                throw new DeleteFileError();
            }
        }
    }


    public async Upload(files: Array<Express.Multer.File>, fileOptions: IFile): Promise<FileReturn[]> {

        let filesPath: FileReturn[] = []
        for (const file of files) {
            //validate the file size aganist the max file size in the fileOptions
            if (file.size > fileOptions.MaxSize)
                throw new MaximumFileSizeExceeds(file.size, fileOptions.MaxSize)


            //Extract Extensions and MimeTypes for repetitive use
            const allowedExtensions = fileOptions.FileType.Extensions;
            const allowedMimes = fileOptions.FileType.MimeTypes;

            const fileType = await fileTypeFromBuffer(file.buffer);
            if (!fileType) {
                throw new FileTypeIsNotAllowed(allowedMimes, allowedExtensions);
            }
            //check if the file mime exist in the fileOptions
            if (!fileOptions.FileType.MimeTypes.includes(fileType.mime)) {
                throw new FileTypeIsNotAllowed(allowedMimes, allowedExtensions);
            }
            //check if the file Extensions exist in the fileOptions
            if (!allowedExtensions.includes(fileType.ext)) {
                throw new FileTypeIsNotAllowed(allowedMimes, allowedExtensions);
            }

            const newFilename = `${Date.now()}_${randomBytes(5).toString("hex")}.${fileType.ext}`;
            const filePath = path.join("files" , fileOptions.Dest, newFilename);

            //Check if the folder of the files exists if not create them
            const mainFolder = path.join("files" , fileOptions.Dest);
            try {
                await access(mainFolder, constants.F_OK);
            } catch (err) {
                await mkdir(mainFolder, { recursive: true });
            }

            //save the file 
            await this.SaveFile(filePath, file.buffer)

            filesPath.push(
                new FileReturn(newFilename, path.join(fileOptions.Dest,newFilename))
            )
        }

        return filesPath;
    }

    /**
     * Save File to the disk
     * @param filePath - string of the file path to be saved
     * @param content - data to be saved as string or buffer
     * @returns Promise<string> - path of the uploaded files
     * @throws Error - If error has happened during the saving
     * @throws FileAlreadyExist - If file is already exist
     */
    private async SaveFile(filePath: string, content:string|Buffer): Promise<string> {
        const fileExists = await access(filePath).then(() => true).catch(() => false);

        if (!fileExists) {
            return new Promise((resolve, reject) => {
                const writeStream = createWriteStream(filePath);

                writeStream.on('error', (error) => {
                    console.log(error)
                    reject(new Error(`File write error: ${error.message}`));
                });

                writeStream.on('finish', () => {
                    resolve(filePath);
                });

                writeStream.end(content);
            });
        } else {
            throw new FileAlreadyExist(filePath);
        }
    }

    /**
     * Check if the filepath is in the fileOptions directory 
     * to try to mitigate the file inclusion attack
     * @param filePath - string of the file path to be saved (MUST PROVIDE WITH "files" prefix)
     * @param fileOptions - options where filePaht will be check by
     * @param thorwError - thow FileNotFound error if the filePath is not in the direcory
     * @returns Promise<boolean> - returns true if file is valid false if file is not in the directory
     * @throws FileNotFound - If file is already exist
     */
    private IsFileLocationValid(filePath: string, fileOptions: IFile, thorwError: boolean = true): boolean {
        if (!filePath.startsWith(path.join(`files`,fileOptions.Dest))) {
            if (thorwError)
                throw new FileNotFound("")
            return false
        }

        return true
    }
}