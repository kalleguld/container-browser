export interface File {
    url:string;

    size: number;
}

export interface Folder {

    subFolders: {[name: string]: Folder};
    files: {[name: string]: File};
}