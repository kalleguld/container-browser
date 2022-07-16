import { Table } from '@kalleguld/react-table/dist/Table';
import { useQueryClient } from 'react-query';
import { useFileList, invalidateFileList } from './queries/fileListQuery';
import { asFileSize } from './util/asFileSize';

function App() {

  const files = useFileList();
  const queryClient = useQueryClient();

  return (
    <div className="App">

      {files.isLoading && <div>Loading, please wait...</div>}

      {files.error && <div> Error: {files.error.text}</div>}

      { files.data &&
        <Table rows={Object.entries(files.data.nodes)} 
          cols={[
            {
              header: 'Name', 
              key: 'Name',
              content: (e) => ((e[1].type === 'file') 
                ? <a href={e[1].url} target='_blank'>{e[0]}</a>
                : e[0]
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

export default App
