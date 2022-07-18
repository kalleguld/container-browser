import { useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';
import { Folder } from './folder';
import { FolderTable } from './FolderTable';
import { useFileList, invalidateFileList } from './queries/fileListQuery';
import { getContainerInfo } from './util/getContainerInfo';
import { VersionLink } from './VersionLink';


export function App() {

  const files = useFileList();
  const queryClient = useQueryClient();
  const location = useLocation();
  const containerInfo = getContainerInfo();

  let selectedFolder: Folder | undefined = getSelectedFolder(files.data, location.pathname);

  return (
    <div className="App">

      <h1>{
        containerInfo
          ? <span>{containerInfo.storageAccount} / {containerInfo.container}</span>
          : <span>Contents</span>
      }</h1>

      <div className='body'>
        {files.isLoading && <div>Loading, please wait...</div>}

        {files.error && <div> Error: {files.error.text}</div>}

        {(!files.isLoading && selectedFolder) && <FolderTable folder={selectedFolder} />}

      </div>

      <div className='footer'>
        {files.dataUpdatedAt &&
          <div>
            Last updated at: <span>{new Date(files.dataUpdatedAt).toLocaleString()}</span>
          </div>
        }
        <button onClick={() => invalidateFileList(queryClient)}>
          {files.isFetching ? "Refreshing" : "Refresh"}
        </button>

        <div>
          <VersionLink />
        </div>
      </div>
    </div>
  )
}

function getSelectedFolder(root: Folder | undefined, pathString: string): Folder | undefined {
  if (pathString === '/' || pathString === "")
    return root;
  const path = pathString.split("/").slice(1);
  let isRoot = true;
  let result = root;

  for (let folderName of path) {
    isRoot = false;
    if (!result) {
      break;
    }
    let folder = result.nodes.find(n => n.type === "folder" && n.name === folderName)
    if (!folder || folder.type !== "folder") {
      console.error("Could not find folder", { folderName, path, location })
      result = undefined;
      break;
    }
    result = folder;
  }
  return result;
}
