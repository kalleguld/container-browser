export interface File {
    type: "file";

    url:string;

    size: number;
    lastModified: Date;
}

export interface Folder {
    type: "folder";

    path: string;
    size: number;
    lastModified: Date;

    nodes: NodeMap;
}

export type NodeMap = {[name: string]: Node};
export type Node = File | Folder;