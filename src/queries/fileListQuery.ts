import { QueryClient, useQuery, UseQueryResult } from "react-query";
import { File, Folder } from "../folder";

const key = 'fileList';

const mockResult = `
<EnumerationResults ContainerName="https://kgnstorage.blob.core.windows.net/athco">
<Blobs>
<Blob>
<Name>AthcoQualityControl_Latest.zip</Name>
<Url>
https://kgnstorage.blob.core.windows.net/athco/AthcoQualityControl_Latest.zip
</Url>
<Properties>
<Last-Modified>Thu, 14 Jul 2022 09:21:40 GMT</Last-Modified>
<Etag>0x8DA657A4284DD4E</Etag>
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
<Name>archive/AthcoQualityControl_1.0.632.0.zip</Name>
<Url>
https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.632.0.zip
</Url>
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
<Url>
https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.633.0.zip
</Url>
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
<Url>
https://kgnstorage.blob.core.windows.net/athco/archive/AthcoQualityControl_1.0.634.0.zip
</Url>
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
</Blobs>
<NextMarker/>
</EnumerationResults>
`;

export function useFileList(): UseQueryResult<Folder> {
    const q = useQuery<Folder>(key, async () => {
        const response = await fetch('./?restype=container&comp=list');
        if (!response.ok)
            throw new Error("Could not get file list");
        const responseText = await response.text();
        //const responseText = mockResult;
        const xml = new DOMParser().parseFromString(responseText, 'text/xml');
        const blobs = xml.getElementsByTagName('Blobs')[0]
            .getElementsByTagName('Blob');
        
        const files: {[name: string]: File} = {};
        for (let blob of blobs){
            const filename = blob.getElementsByTagName('Name')[0].innerHTML;
            const url= blob.getElementsByTagName("Url")[0].innerHTML;
            const size = parseInt(blob.getElementsByTagName('Content-Length')[0].innerHTML);
            files[filename] = { size, url };
        }

        return {
            files: files,
            subFolders: {},
        }
    });
    return q;
}

export function invalidateFileList(queryClient: QueryClient){
    queryClient.invalidateQueries(key);
}