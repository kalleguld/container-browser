export interface INodeBase{
    name: string;
    size: number;
    lastModified: Date;
}

export interface File extends INodeBase {
    type: "file";

    url:string;
}

export interface Folder extends INodeBase {
    type: "folder";

    path: string;
    nodes: INode[];
}

export type INode = File | Folder;