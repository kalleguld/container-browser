import { Table } from '@kalleguld/react-table/dist/Table';
import { useQueryClient } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { Folder } from './folder';
import { useFileList, invalidateFileList } from './queries/fileListQuery';
import { asFileSize } from './util/asFileSize';

function App() {

  const files = useFileList();
  const queryClient = useQueryClient();
  const location = useLocation();

  let selectedFolder: Folder|undefined = getSelectedFolder(files.data, location.pathname)

  return (
    <div className="App">

      {files.isLoading && <div>Loading, please wait...</div>}

      {files.error && <div> Error: {files.error.text}</div>}

      { (!files.isLoading && selectedFolder) &&
        <Table rows={Object.entries(selectedFolder.nodes)} 
          cols={[
            {
              header: 'Type',
              key: 'type',
              content: (e) => e[1].type === 'file' ? 'File' : 'Folder'
            },
            {
              header: 'Name', 
              key: 'Name',
              content: (e) => ((e[1].type === 'file') 
                ? <a href={e[1].url} target='_blank'>{e[0]}</a>
                : <Link to={e[1].path}>{e[0]}</Link>
               ) ,
              sorter: (a, b) => a[0].localeCompare(b[0])
            },
            {
              header: 'File size', 
              key: 'filesize', 
              content: (e) => asFileSize(e[1].size).text,
              sorter: (a, b) => a[1].size - b[1].size
            },
            {
              header: "Last modified",
              key: 'lastModified',
              content: (e => e[1].lastModified.toLocaleString()),
              sorter: (a, b) => a[1].lastModified.valueOf() - b[1].lastModified.valueOf()
            }
          ]}
        />
      }


      {files.dataUpdatedAt && 
        <div>
          Last updated at: <span>{new Date(files.dataUpdatedAt).toLocaleString()}</span>
        </div> 
      }
      <button onClick={() => invalidateFileList(queryClient)}>
        {files.isFetching ? "Refreshing" : "Refresh"}
      </button>

      <div>
        <a href="https://github.com/kalleguld/container-browser" target="_blank">Source</a>
      </div>
    </div>
  )
}

function getSelectedFolder(root: Folder|undefined, pathString: string): Folder|undefined{
  if (pathString === '/')
    return root;
  const path = pathString.split("/").slice(1);
  let isRoot = true;
  let result = root;

  for (let folderName of path){
    isRoot = false;
    if (!result){
      break;
    }
    let folder = result.nodes[folderName];
    if (!folder || folder.type !== "folder"){
      console.error("Could not find folder", {folderName, path, location})
      result = undefined;
      break;
    }
    result = folder;
  }
  return result;
}

export default App
