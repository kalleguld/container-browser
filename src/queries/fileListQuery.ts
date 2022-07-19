import { QueryClient, useQuery, UseQueryResult } from "react-query";
import { File, Folder, Inode } from "../folder";

const key = 'fileList';

export function useFileList(): UseQueryResult<Folder, FileListError> {
    const q = useQuery<Folder, FileListError>(key, async () => {
        
        const responseText = (import.meta.env.DEV 
         ? await getDummyXml()
         : await getXml());
        const rawFiles = getRawFiles(responseText);
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

async function getDummyXml(){
    await new Promise(resolve => setTimeout(resolve, 1000));
    return dummyXml;
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

const dummyXml = `
<EnumerationResults ContainerName="https://containerbrowserexample.blob.core.windows.net/example-1/">
<Blobs>
<Blob>
<Name>a/b/c/d/e/helloworld.png</Name>
<Url>
https://containerbrowserexample.blob.core.windows.net/example-1/a/b/c/d/e/helloworld.png
</Url>
<Properties>
<Last-Modified>Tue, 19 Jul 2022 08:20:58 GMT</Last-Modified>
<Etag>0x8DA695F9C0C582F</Etag>
<Content-Length>23773</Content-Length>
<Content-Type>image/png</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5>y9Gm7jVrBhlE/N3k2gENHw==</Content-MD5>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>a/b/c/d/f/Techsoft bg darkened.jpg</Name>
<Url>
https://containerbrowserexample.blob.core.windows.net/example-1/a/b/c/d/f/Techsoft bg darkened.jpg
</Url>
<Properties>
<Last-Modified>Tue, 19 Jul 2022 08:21:48 GMT</Last-Modified>
<Etag>0x8DA695FB99E670B</Etag>
<Content-Length>820725</Content-Length>
<Content-Type>image/jpeg</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5>2sXWnmftCIkCULZANR0hCg==</Content-MD5>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>a/b/c/d/f/zvamp.jpg</Name>
<Url>
https://containerbrowserexample.blob.core.windows.net/example-1/a/b/c/d/f/zvamp.jpg
</Url>
<Properties>
<Last-Modified>Tue, 19 Jul 2022 08:21:15 GMT</Last-Modified>
<Etag>0x8DA695FA6535013</Etag>
<Content-Length>162883</Content-Length>
<Content-Type>image/jpeg</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5>CNR5X+zRsXhYZQmFvEFgNA==</Content-MD5>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>asFileSize.ts</Name>
<Url>
https://containerbrowserexample.blob.core.windows.net/example-1/asFileSize.ts
</Url>
<Properties>
<Last-Modified>Mon, 18 Jul 2022 11:52:58 GMT</Last-Modified>
<Etag>0x8DA68B40EFBEFB9</Etag>
<Content-Length>436</Content-Length>
<Content-Type>text/plain</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5>g2xczx/Oc140cMB4QHh+Qg==</Content-MD5>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>browse.html</Name>
<Url>
https://containerbrowserexample.blob.core.windows.net/example-1/browse.html
</Url>
<Properties>
<Last-Modified>Mon, 18 Jul 2022 13:51:59 GMT</Last-Modified>
<Etag>0x8DA68C4AF5062E3</Etag>
<Content-Length>212480</Content-Length>
<Content-Type>text/html</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5>+z0jsRkS2Qy8ryTOKcfJBw==</Content-MD5>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
</Blobs>
<NextMarker/>
</EnumerationResults>
`;