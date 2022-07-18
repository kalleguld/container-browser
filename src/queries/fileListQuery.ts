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
<EnumerationResults ContainerName="https://kgnstorage.blob.core.windows.net/athco/">
<Blobs>
<Blob>
<Name>AthcoQualityControl_Latest.zip</Name>
<Url>https://kgnstorage.blob.core.windows.net/athco/AthcoQualityControl_Latest.zip</Url>
<Properties>
<Last-Modified>Fri, 15 Jul 2022 11:15:57 GMT</Last-Modified>
<Etag>0x8DA66536463E351</Etag>
<Content-Length>26703779</Content-Length>
<Content-Type>application/x-zip-compressed</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5/>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>archive/AthcoQualityControl_1.0.632.0.zip</Name>
<Url>https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.632.0.zip</Url>
<Properties>
<Last-Modified>Thu, 14 Jul 2022 06:37:55 GMT</Last-Modified>
<Etag>0x8DA656362514F5A</Etag>
<Content-Length>26700548</Content-Length>
<Content-Type>application/x-zip-compressed</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5/>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>archive/AthcoQualityControl_1.0.633.0.zip</Name>
<Url>https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.633.0.zip</Url>
<Properties>
<Last-Modified>Thu, 14 Jul 2022 06:56:46 GMT</Last-Modified>
<Etag>0x8DA656604C7C445</Etag>
<Content-Length>26700557</Content-Length>
<Content-Type>application/x-zip-compressed</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5/>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>archive/AthcoQualityControl_1.0.634.0.zip</Name>
<Url>https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.634.0.zip</Url>
<Properties>
<Last-Modified>Thu, 14 Jul 2022 09:21:57 GMT</Last-Modified>
<Etag>0x8DA657A4CA512B5</Etag>
<Content-Length>26701901</Content-Length>
<Content-Type>application/x-zip-compressed</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5/>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>archive/AthcoQualityControl_1.0.635.0.zip</Name>
<Url>https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.635.0.zip</Url>
<Properties>
<Last-Modified>Fri, 15 Jul 2022 11:16:24 GMT</Last-Modified>
<Etag>0x8DA6653748415E1</Etag>
<Content-Length>26703779</Content-Length>
<Content-Type>application/x-zip-compressed</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5/>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
<Blob>
<Name>browse.html</Name>
<Url>https://kgnstorage.blob.core.windows.net/athco/browse.html</Url>
<Properties>
<Last-Modified>Mon, 18 Jul 2022 09:09:11 GMT</Last-Modified>
<Etag>0x8DA689D2D9E250E</Etag>
<Content-Length>205575</Content-Length>
<Content-Type>text/html</Content-Type>
<Content-Encoding/>
<Content-Language/>
<Content-MD5>ljYJg9pKGlN30+UVmTjbcg==</Content-MD5>
<Cache-Control/>
<BlobType>BlockBlob</BlobType>
<LeaseStatus>unlocked</LeaseStatus>
</Properties>
</Blob>
</Blobs>
<NextMarker/>
</EnumerationResults>
`;