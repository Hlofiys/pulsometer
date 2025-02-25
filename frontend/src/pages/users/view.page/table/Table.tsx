import { ReactNode } from "react";
import styles from "./Table.module.scss";
import TableRow, { FieldConfig } from "./row/Row";
import { AnimatePresence } from "framer-motion";

interface TableProps<T> {
  data: T[];
  onClick?: (value: T) => void;
  fields: FieldConfig<T>[];
  getKey: (row: T) => number;
  getIndex?: (row: T) => number;
  children?: ReactNode;
  isEdit?: boolean;
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
        <AnimatePresence>
          {data.map((row) => (
            <TableRow
              key={getKey(row)}
              fields={fields}
              rowData={row}
              isEdit={isEdit}
              index={getIndex ? getIndex(row) : getKey(row)}
              onClick={onClick}
            />
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  );
};

export default Table;
