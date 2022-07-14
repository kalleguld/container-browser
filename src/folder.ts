export interface File {
    type: "file";

    url:string;

    size: number;
}

export interface Folder {
    type: "folder";

    path: string;
    nodes: {[name: string]: Node};
}

export type Node = File | Folder;