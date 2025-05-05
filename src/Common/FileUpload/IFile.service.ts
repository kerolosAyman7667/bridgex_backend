import { StreamableFile } from "@nestjs/common"
import { FileService } from "./File.service"
import { IFile } from "./FileTypes/IFile"
import { FileReturn } from "./FileReturn"

export interface IFileService {
    /**
     * Upload file
     * @param {Express.Multer.File[]} files - files to be uploaded
     * @param {IFile} fileOptions - the fileoptions that will be validated against files and saves 
     * @returns {Promise<FileReturn[]>} Promise<FileReturn[]> - array of path and name of the uploaded files
     * @throws MaximumFileSizeExceeds - if the file size exceed the max size in the fileOptions
     * @throws FileTypeIsNotAllowed - If mime type, Extensions are not in the exist in fileOptions
     * @throws InternalServerError - If error has happened during the saving
     * @throws FileAlreadyExist - If file is already exist
     */
    Upload(files: Express.Multer.File[], fileOptions: IFile): Promise<FileReturn[]>
    
    /**
     * Upload file - It upload the provided file then tries to delete the old 
     * @param {Express.Multer.File} file - file to be uploaded
     * @param {IFile} fileOptions - the fileoptions that will be validated against files and saves 
     * @param {string} oldFilePath - the old file path that will be updated 
     * @param {boolean} IgnoreUnFoundError - will raise error if trying to delete the old file and didn't find it
     * @returns {Promise<FileReturn>} Promise<FileReturn> - path and name of the uploaded files
     * @throws MaximumFileSizeExceeds - if the file size exceed the max size in the fileOptions
     * @throws FileTypeIsNotAllowed - If mime type, Extensions are not in the exist in fileOptions
     * @throws InternalServerError - If error has happened during the saving
     * @throws UpadeFileError - if oldPath hadn't been founded and IgnoreUnFoundError was false
     * @throws FileAlreadyExist - If file is already exist
     * @throws FileNotFound - if oldPath didn't provided and IgnoreUnFoundError was false
     */
    Update(file: Express.Multer.File, fileOptions: IFile, oldFilePath?: string,IgnoreUnFoundError?:boolean): Promise<FileReturn>

    /**
     * Delete file
     * @param {string} filepath - file path to be deleted (DO NOT PROVIDE WITH "files" prefix)
     * @param {IFile} fileOptions - the fileoptions that will be validated against files and saves 
     * @param {boolean} IgnoreUnFoundError - will raise error if trying to delete the old file and didn't find it
     * @returns {void} Promise<void> 
     * @throws {DeleteFileError} DeleteFileError - if error happened during the process
     * @throws {FileNotFound} FileNotFound - if filepath hadn't been founded and IgnoreUnFoundError was false
     */
    Remove(filepath:string, fileOptions:IFile,IgnoreUnFoundError?:boolean): Promise<void>


    /**
     * Get file
     * @param {string} filePath - file path (DO NOT PROVIDE WITH "files" prefix)
     * @param {IFile} fileOptions - the fileoptions that will be validated against files and saves 
     * @returns {StreamableFile} Promise<StreamableFile> 
     * @throws FileNotFound - if filepath hadn't been founded
     */
    Get(filePath: string, fileOptions:IFile): Promise<StreamableFile>

    /**
     * 
     * @param filePath - file path (DO NOT PROVIDE WITH "files" prefix)
     */
    ConvertToPdf(filePath: string) : Promise<Buffer>
}

export const IFileService = Symbol("IFileService")

export const IFileServiceProvider = {
    provide: IFileService,
    useClass: FileService,
}