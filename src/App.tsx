import { useQueryClient } from 'react-query';
import { useFileList, invalidateFileList } from './queries/fileListQuery';
import { asFileSize } from './util/asFileSize';

function App() {

  const files = useFileList();
  const queryClient = useQueryClient();

  const items = (files.data?.nodes) && Object.entries(files.data.nodes)
    .map(([name, node]) => (node.type === 'file') && (
      <li key={name}>
        <a href={node.url}>
          {name}
        </a>
        ( {asFileSize(node.size).text} )
      </li>
    ))

  return (
    <div className="App">

      {files.isLoading && <div>Loading, please wait...</div>}

      {files.error && <div> Error: {files.error.text}</div>}

      {files.data && <ul>
        {items}
      </ul>}


      <div>
        Last updated at: <span>{new Date(files.dataUpdatedAt).toLocaleString()}</span>
      </div>
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
