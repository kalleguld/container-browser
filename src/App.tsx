import { useState } from 'react'
import './App.css'
import { useFileList } from './queries/fileListQuery'
import { asFileSize } from './util/asFileSize';

function App() {

  const files = useFileList();

  const items = (files.data?.files) && Object.entries(files.data.files)
    .map(([name, file]) => (
      <li key={name}>
        <a href={file.url}>
          {name}
        </a>
        ( {asFileSize(file.size).text} )
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
