export interface InodeBase{
    name: string;
    size: number;
    lastModified: Date;
    path: string;
}

export interface File extends InodeBase {
    type: "file";

    url:string;
    splitPath: string[];
}

export interface Folder extends InodeBase {
    type: "folder";
    nodes: Inode[];
}

export type Inode = File | Folder;