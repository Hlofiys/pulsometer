import { ReactNode } from "react";
import styles from "./Table.module.scss";
import TableRow, { FieldConfig } from "./row/Row";

interface TableProps<T> {
  data: T[];
  onClick?: (value: T) => void;
  fields: FieldConfig<T>[];
  getKey: (row: T) => number;
  getIndex?: (row: T) => number;
  children?: ReactNode;
  isEdit?:boolean
}

const Table = <T,>(props: TableProps<T>): JSX.Element => {
  const { data, onClick, fields, getKey, getIndex, isEdit } = props;

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
        {data.map((row) => (
          <TableRow
            fields={fields}
            key={getKey(row)}
            rowData={row}
            isEdit={isEdit}
            index={getIndex ? getIndex(row) : getKey(row)}
            onClick={onClick}
          />
        ))}
      </tbody>
    </table>
  );
};

export default Table;
