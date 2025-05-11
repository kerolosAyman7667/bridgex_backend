export class FileReturn {
    FileName: string

    FilePath: string

    Extension: string

    OriginalName:string

    constructor(FileName: string, FilePath: string, Extension: string,OriginalName:string) {
        this.FileName = FileName
        this.FilePath = FilePath
        this.Extension = Extension
        this.OriginalName = OriginalName
    }
}