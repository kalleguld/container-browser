import { Table } from "@kalleguld/react-table";
import { Link } from "react-router-dom";
import { Folder } from "./folder";
import { asFileSize } from "./util/asFileSize";
import '/node_modules/@kalleguld/react-table/dist/table.css'

export function FolderTable(props: { folder: Folder }) {
  return (<Table
    className='table'
    rows={props.folder.nodes}
    rowKey={(inode, idx) => idx}

    cols={[
      {
        header: 'Name',
        key: 'Name',
        content: (inode) => ((inode.type === 'file')
          ? <a href={inode.url} target='_blank'>{inode.name}</a>
          : getNameContent(inode)
        ),
        sorter: (a, b) => a.name.localeCompare(b.name)
      },
      {
        header: 'Type',
        key: 'type',
        content: ((inode) => inode.type === 'file'
          ? <span title='File'>📇</span>
          : <span title='Folder'>📁</span>),
        sorter: (a, b) => a.type.localeCompare(b.type),

      },
      {
        header: 'File size',
        key: 'filesize',
        content: (inode) => asFileSize(inode.size).text,
        sorter: (a, b) => a.size - b.size
      },
      {
        header: "Last modified",
        key: 'lastModified',
        content: (inode => inode.lastModified.toLocaleString()),
        sorter: (a, b) => a.lastModified.valueOf() - b.lastModified.valueOf()
      }
    ]}
  />)
}

function getNameContent(f: Folder) {
  const subFolders: Folder[] = [f];
  let onlySubfolder: Folder = f;

  while (true) {
    if (onlySubfolder.nodes.length !== 1)
      break;
    const subsub = onlySubfolder.nodes[0];
    if (subsub?.type !== 'folder')
      break;
    onlySubfolder = subsub;
    subFolders.push(subsub);
  }

  return subFolders.map((sf, idx) => (
    <span key={idx}>
      {idx > 0 && <span>/</span>}
      <Link to={sf.path}>{sf.name}</Link>
    </span>
  ))

}