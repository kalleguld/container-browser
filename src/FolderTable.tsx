import { Table } from "@kalleguld/react-table";
import { Link } from "react-router-dom";
import { Folder } from "./folder";
import { asFileSize } from "./util/asFileSize";
import '/node_modules/@kalleguld/react-table/dist/table.css'

export function FolderTable(props: {folder: Folder}){
    return (<Table 
        className='table'
        rows={props.folder.nodes} 
        cols={[
          {
            header: 'Name', 
            key: 'Name',
            content: (e) => ((e.type === 'file') 
              ? <a href={e.url} target='_blank'>{e.name}</a>
              : <Link to={e.path}>{e.name}</Link>
             ) ,
            sorter: (a, b) => a.name.localeCompare(b.name)
          },
          {
            header: 'Type',
            key: 'type',
            content: ((e) => e.type === 'file' 
              ? <span title='File'>📇</span> 
              : <span title='Folder'>📁</span>),
            sorter: (a,b)=> a.type.localeCompare(b.type),

          },
          {
            header: 'File size', 
            key: 'filesize', 
            content: (e) => asFileSize(e.size).text,
            sorter: (a, b) => a.size - b.size
          },
          {
            header: "Last modified",
            key: 'lastModified',
            content: (e => e.lastModified.toLocaleString()),
            sorter: (a, b) => a.lastModified.valueOf() - b.lastModified.valueOf()
          }
        ]}
      />)
}