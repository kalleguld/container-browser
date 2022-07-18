import { QueryClient, useQuery, UseQueryResult } from "react-query";
import { Folder, INode } from "../folder";

const key = 'fileList';

export function useFileList(): UseQueryResult<Folder, FileListError> {
    const q = useQuery<Folder, FileListError>(key, async () => {
        // const response = await fetch('./?restype=container&comp=list');
        // if (!response.ok){
        //     const err: FileListError = {
        //         text: `Error loading file list: ${response.status} ${response.statusText}`
        //     };
        //     throw err;
        // }
        // const responseText = await response.text();
        // const folder = parseXml(responseText);
        const folder = parseXml2(); //TODO
        return folder;
    });
    return q;
}

function parseXml(responseText:string): Folder {

    // using "!" to avoid undefined-checks is OK in this function,
    // because any errors are caught in the try/catch.
    try{
        const xml = new DOMParser().parseFromString(responseText, 'text/xml');
        const blobs = xml.getElementsByTagName('Blobs')[0]!
            .getElementsByTagName('Blob');
        
        const nodes: INode[] = [];
        for (let blob of blobs){
            const filename = blob.getElementsByTagName('Name')[0]!.innerHTML;
            const url = blob.getElementsByTagName("Url")[0]!.innerHTML;
            const size = parseInt(blob.getElementsByTagName('Content-Length')[0]!.innerHTML);
            const lastModified = new Date(blob.getElementsByTagName('Last-Modified')[0]!.innerHTML);
            nodes.push({ 
                type: 'file', 
                name: filename,
                size, 
                url,
                lastModified
            });
        }
        const rootFolder: Folder = {
            nodes, 
            type:'folder', 
            path: '',
            name: '',
            size: totalSize(nodes),
            lastModified: maxDate(nodes),
        };
        return rootFolder;
    }
    catch (ex){
        const err: FileListError = {
            text: `Could not parse file list.`,
            error: (ex instanceof(Error)) ? ex : undefined
        };
        throw err;
    }
}

function parseXml2(): Folder{
    return {
        type: "folder",
        name: "",
        lastModified: new Date(),
        path: "",
        size: 4,
        nodes: [
            {
                type: "file",
                name: "a",
                url: "http://localhost/a",
                lastModified: new Date(),
                size: 4
            },
            {
                type: "folder",
                name: "b",
                lastModified: new Date(),
                path: "b",
                size: 8,
                nodes:[
                    {
                        type: "folder",
                        name: "c",
                        lastModified: new Date(),
                        path: "b/c",
                        size: 8, 
                        nodes:[
                            {
                                type: "file",
                                name: "d",
                                url: "http://localhost/b/c/d",
                                lastModified: new Date(),
                                size: 4
                            },
                            {
                                type: "file",
                                name: "e",
                                url: "http://localhost/b/c/e",
                                lastModified: new Date(),
                                size: 4
                            },
                        ],
                    }
                ],
            }
        ]
    }
}

function maxDate(nodes: INode[]){
    let result = Number.MIN_VALUE;
    for (let node of Object.values(nodes)){
        result = Math.max(result, node.lastModified.valueOf())
    }
    return new Date(result);
}
function totalSize(nodes: INode[]){
    let result = 0;
    for (let node of Object.values(nodes)){
        result += node.size;
    }
    return result;
}


export function invalidateFileList(queryClient: QueryClient){
    queryClient.invalidateQueries(key);
}

export interface FileListError{
    text:string;
    error?: Error;
}