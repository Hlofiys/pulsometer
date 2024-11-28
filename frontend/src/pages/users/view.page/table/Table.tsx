import { ReactNode } from "react";
import styles from "./Table.module.scss";
import TableRow, { FieldConfig } from "./row/Row";

interface TableProps<T> {
  data: T[];
  onClick?: (value: T) => void;
  fields: FieldConfig<T>[];
  getKey: (row: T) => number;
  getIndex?: (index: number) => number;
  children?: ReactNode;
}

const Table = <T,>(props: TableProps<T>): JSX.Element => {
  const { data, onClick, fields, getKey, children, getIndex } = props;

  return (
    <table className={styles.customTable}>
      <thead>
        <tr>
          <th>№ п/п</th>
          {fields.map((field) => (
            <th key={field.key as string}>{field.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <TableRow
            fields={fields}
            onSave={(updatedData) => console.log(updatedData)}
            onDelete={(id) => console.log(`Удалить пользователя с ID ${id}`)}
            key={getKey(row)}
            rowData={row}
            index={getIndex ? getIndex(index) : getKey(row)}
            onClick={onClick}
          >
            {children}
          </TableRow>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
