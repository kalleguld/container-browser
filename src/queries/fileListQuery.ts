import { QueryClient, useQuery, UseQueryResult } from "react-query";
import { File, Folder, Inode } from "../folder";

const key = 'fileList';

export function useFileList(): UseQueryResult<Folder, FileListError> {
    const q = useQuery<Folder, FileListError>(key, async () => {
        const responseText = await getXml();
        const rawFiles = getRawFiles(responseText);
        //const rawFiles = getDummyFiles(); //TODO
        const files = rawFiles.map(toFile);
        const folder = folderize(files, []);
        return folder;
    });
    return q;
}

async function getXml() {
    const response = await fetch('./?restype=container&comp=list');
    if (!response.ok) {
        const err: FileListError = {
            text: `Error loading file list: ${response.status} ${response.statusText}`
        };
        throw err;
    }
    const responseText = await response.text();
    return responseText;
}

function getRawFiles(responseText: string): RawFile[] {
    // using "!" to avoid undefined-checks is OK in this function,
    // because any errors are caught in the try/catch.
    try {
        const xml = new DOMParser().parseFromString(responseText, 'text/xml');
        const blobs = xml.getElementsByTagName('Blobs')[0]!
            .getElementsByTagName('Blob');

        const files: RawFile[] = [];
        for (let blob of blobs) {
            const filename = blob.getElementsByTagName('Name')[0]!.innerHTML;
            const url = blob.getElementsByTagName("Url")[0]!.innerHTML;
            const size = parseInt(blob.getElementsByTagName('Content-Length')[0]!.innerHTML);
            const lastModified = new Date(blob.getElementsByTagName('Last-Modified')[0]!.innerHTML);
            files.push({
                filename,
                size,
                url,
                lastModified
            });
        }
        return files;

    }
    catch (ex) {
        const err: FileListError = {
            text: `Could not parse file list.`,
            error: (ex instanceof (Error)) ? ex : undefined
        };
        throw err;
    }
}

function toFile(rawFile: RawFile): File {
    const splitPath = rawFile.filename.split("/");
    return {
        lastModified: rawFile.lastModified,
        url: rawFile.url,
        type: "file",
        size: rawFile.size,
        splitPath,
        path: rawFile.filename,
        name: splitPath[splitPath.length - 1]!
    }
}


function folderize(files: File[], path: string[]): Folder {
    const depth = path.length;
    const subFolders: { [n: string]: File[] } = {};
    const currentFiles: File[] = [];
    for (const file of files) {
        if (file.splitPath.length <= depth + 1) {
            currentFiles.push(file);
            continue;
        }
        const subFolderName = file.splitPath[depth]!;
        let subFolder = subFolders[subFolderName];
        if (!subFolder) {
            subFolder = [];
            subFolders[subFolderName] = subFolder;
        }
        subFolder.push(file);
    }
    const subFolderList = Object.entries(subFolders).map(([name, subFolderFiles]) => folderize(subFolderFiles, [...path, name]))

    const rootFolder: Folder = {
        nodes: [...currentFiles, ...subFolderList],
        type: 'folder',
        path: path.join("/"),
        name: path.length === 0 ? "" : (path[path.length - 1] ?? "?? ? ??"),
        size: totalSize(files),
        lastModified: maxDate(files),
    };
    return rootFolder;
}

function getDummyFiles(): RawFile[] {
    return [
        {
            filename: "b/c/d",
            url: "http://localhost/b/c/d",
            lastModified: new Date(),
            size: 4
        },
        {
            filename: "b/c/e",
            url: "http://localhost/b/c/e",
            lastModified: new Date(),
            size: 4
        },
        {
            filename: "a",
            url: "http://localhost/a",
            lastModified: new Date(),
            size: 4
        }
    ]
}

interface RawFile {
    filename: string;
    url: string;
    size: number;
    lastModified: Date;
}

function maxDate(nodes: Inode[]) {
    let result = Number.MIN_VALUE;
    for (let node of Object.values(nodes)) {
        result = Math.max(result, node.lastModified.valueOf())
    }
    return new Date(result);
}
function totalSize(nodes: Inode[]) {
    let result = 0;
    for (let node of Object.values(nodes)) {
        result += node.size;
    }
    return result;
}


export function invalidateFileList(queryClient: QueryClient) {
    queryClient.invalidateQueries(key);
}

export interface FileListError {
    text: string;
    error?: Error;
}