import { QueryClient, useQuery, UseQueryResult } from "react-query";
import { Folder, Node } from "../folder";

const key = 'fileList';

export function useFileList(): UseQueryResult<Folder> {
    const q = useQuery<Folder>(key, async () => {
        const response = await fetch('./?restype=container&comp=list');
        if (!response.ok)
            throw new Error("Could not get file list");
        const responseText = await response.text();
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
    });
    return q;
}

export function invalidateFileList(queryClient: QueryClient){
    queryClient.invalidateQueries(key);
}