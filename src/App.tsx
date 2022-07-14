import './App.css'
import { useFileList } from './queries/fileListQuery'
import { asFileSize } from './util/asFileSize';

function App() {

  const files = useFileList();

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
      <ul>
        {items}
      </ul>
    </div>
  )
}

export default App
