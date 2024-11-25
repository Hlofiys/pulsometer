import { FC } from "react";
import styles from "./Table.module.scss";
import TableRow, { TableRowFormValues } from "./row/Row";

interface TableProps {
  data: TableRowFormValues[];
  onClick?: (value: string | number) => void;
}

const Table: FC<TableProps> = ({ data, onClick }) => {
  return (
    <table className={styles.customTable}>
      <thead>
        <tr>
          <th>№ п/п</th>
          <th>Фамилия</th>
          <th>Имя</th>
          <th>Отчество</th>
          {/* <th>Возраст</th> */}
          {/* <th>Дата измерений</th> */}
          <th>Устройство</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <TableRow
            key={row.userId}
            rowData={row}
            index={row.userId}
            onClick={onClick}
            onSave={(data) => console.log(data)}
          />
        ))}
      </tbody>
    </table>
  );
};

export default Table;
