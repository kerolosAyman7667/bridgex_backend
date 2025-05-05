export class FileReturn {
    FileName: string

    FilePath: string

    Extension: string

    constructor(FileName: string, FilePath: string, Extension: string) {
        this.FileName = FileName
        this.FilePath = FilePath
        this.Extension = Extension
    }
}