import { useQueryClient } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { Folder } from './folder';
import { FolderTable } from './FolderTable';
import { useFileList, invalidateFileList } from './queries/fileListQuery';
import { getContainerInfo } from './util/getContainerInfo';
import { PartPiece, splitPath } from './util/splitPath';
import { VersionLink } from './VersionLink';


export function App() {

  const files = useFileList();
  const queryClient = useQueryClient();
  const location = useLocation();
  const path = splitPath(location.pathname);
  const containerInfo = getContainerInfo();

  let selectedFolder: Folder | undefined = getSelectedFolder(files.data, path);

  return (
    <div className="App">

      <div className='header'>
        <h1>{
          containerInfo
            ? <span>{containerInfo.storageAccount} / {containerInfo.container}</span>
            : <span>Contents</span>
        }</h1>
        <h2>
          <Link to="/">[ Root ]</Link>
          {path.map((p, n) => (
            <span key={n}>
              <span>/</span>
              <Link to={p.path}>{p.name}</Link>
            </span>
            
          ))}
        </h2>
      </div>

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

function getSelectedFolder(root: Folder | undefined, path: PartPiece[]): Folder | undefined {
  if (path.length === 0)
    return root;
  let result = root;

  for (let folderPiece of path) {
    if (!result) {
      break;
    }
    let folder = result.nodes.find(n => n.type === "folder" && n.name === folderPiece.name)
    if (!folder || folder.type !== "folder") {
      console.error("Could not find folder", { folderName: folderPiece, path, location })
      result = undefined;
      break;
    }
    result = folder;
  }
  return result;
}
