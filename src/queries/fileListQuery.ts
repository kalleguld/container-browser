import { QueryClient, useQuery, UseQueryResult } from "react-query";
import { Folder, Node } from "../folder";

const key = 'fileList';

export function useFileList(): UseQueryResult<Folder, FileListError> {
    const q = useQuery<Folder, FileListError>(key, async () => {
        const response = await fetch('./?restype=container&comp=list');
        if (!response.ok){
            const err: FileListError = {
                text: `Error loading file list: ${response.status} ${response.statusText}`
            };
            throw err;
        }
        const responseText = await response.text();
        try{
            const folder = parseXml(responseText);
            return folder;
        }
        catch (ex){
            const err: FileListError = {
                text: `Could not parse file list.`,
                error: (ex instanceof(Error)) ? ex : undefined
            };
            throw err;
        }
    });
    return q;
}

function parseXml(responseText:string){
    const xml = new DOMParser().parseFromString(responseText, 'text/xml');
    const blobs = xml.getElementsByTagName('Blobs')[0]
        .getElementsByTagName('Blob');
    
    const nodes: {[name: string]: Node} = {};
    for (let blob of blobs){
        const filename = blob.getElementsByTagName('Name')[0].innerHTML;
        const url= blob.getElementsByTagName("Url")[0].innerHTML;
        const size = parseInt(blob.getElementsByTagName('Content-Length')[0].innerHTML);
        nodes[filename] = { type:'file', size, url };
    }

    return {nodes, type:'folder', path: ''} as Folder;
}

export function invalidateFileList(queryClient: QueryClient){
    queryClient.invalidateQueries(key);
}

export interface FileListError{
    text:string;
    error?: Error;
}