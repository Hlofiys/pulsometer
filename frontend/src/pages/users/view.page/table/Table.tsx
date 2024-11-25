import { FC } from 'react';
import styles from './Table.module.scss';
import TableRow from './row/Row';

export interface ITableRow {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  age: number;
  date: string;
  device: string;
}

interface TableProps {
  data: ITableRow[];
}

const Table: FC<TableProps> = ({ data }) => {
  return (
    <table className={styles.customTable}>
      <thead>
        <tr>
          <th>№ п/п</th>
          <th>Фамилия</th>
          <th>Имя</th>
          <th>Отчество</th>
          {/* <th>Возраст</th> */}
          <th>Дата измерений</th>
          <th>Устройство</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <TableRow rowData={row} index={row.id} key={index} onSave={(data)=>console.log(data)}/>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
