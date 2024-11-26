import { FC, ReactNode } from "react";
import styles from "./Row.module.scss";

interface TableRowProps<T> {
  index: number;
  rowData: T;
  fields: FieldConfig<T>[]; // Конфигурация полей
  onSave?: (data: T) => void; // Сохранение изменений
  onDelete?: (id: number) => void; // Удаление записи
  onClick?: (id: number) => void; // Обработчик клика
  children?: ReactNode;
}

export interface FieldConfig<T> {
  key: keyof T; // Ключ поля
  label?: string; // Отображаемое имя
  type: "text" | "dropdown"; // Тип поля
  isLoading?: boolean;
  renderStatic?: (value: any) => JSX.Element | string; // Кастомный рендеринг для статичного значения
  dropdownOptions?: { label: string; value: any }[]; // Опции для выпадающего списка
  dropdownLoading?: boolean; // Состояние загрузки
}

const TableRow: FC<TableRowProps<any>> = (props) => {
  const { index, rowData, fields, onClick, children } = props;

  // Обработчик клика по строке
  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("." + styles.icon) ||
      target.closest("." + styles.deviceButton)
    ) {
      return;
    }
    onClick && onClick(rowData.userId);
  };

  return (
    <tr className={styles.tableRow} onClick={handleRowClick}>
      <td>
        <div className={styles.tableIndex}>{index}</div>
      </td>
      {fields.map((field: any) => (
        <td key={field.key as string}>
          {field.renderStatic
            ? field.renderStatic(rowData[field.key])
            : rowData[field.key]}
        </td>
      ))}
      {children}
    </tr>
  );
};

export default TableRow;
