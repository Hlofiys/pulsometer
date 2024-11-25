import { FC, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import styles from "./Row.module.scss";
import Basket from "../../../../../ui/icons/Basket";
import Edit from "../../../../../ui/icons/Edit";
import Input from "../../../../../ui/input/primary/PrimaryInput";
import Save from "../../../../../ui/icons/Save";

interface TableRowProps {
  index: number;
  rowData: {
    lastName: string;
    firstName: string;
    middleName: string;
    age: number;
    date: string;
    device: string;
  };
  onSave?: (data: TableRowFormValues) => void; // Функция сохранения изменений
}

interface TableRowFormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  age: number;
  date: string;
  device: string;
}

const TableRow: FC<TableRowProps> = ({ index, rowData, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { control, handleSubmit } = useForm<TableRowFormValues>({
    defaultValues: rowData,
  });

  // Сохранение изменений
  const handleSave = (data: TableRowFormValues) => {
    setIsEditing(false); // Отключить режим редактирования
    onSave && onSave(data); // Передать данные в родительский компонент
  };

  return (
    <tr className={styles.tableRow}>
      <td>
        <div className={styles.tableIndex}>{index}</div>
      </td>
      <td>
        {isEditing ? (
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input {...field} style={{minHeight: 20}} />
            )}
          />
        ) : (
          rowData.lastName
        )}
      </td>
      <td>
        {isEditing ? (
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input {...field} style={{minHeight: 20}} />
            )}
          />
        ) : (
          rowData.firstName
        )}
      </td>
      <td>
        {isEditing ? (
          <Controller
            name="middleName"
            control={control}
            render={({ field }) => (
              <Input {...field} style={{minHeight: 20}} />
            )}
          />
        ) : (
          rowData.middleName
        )}
      </td>
      <td>
        {isEditing ? (
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input type="date" {...field} style={{minHeight: 20}} />
            )}
          />
        ) : (
          rowData.date
        )}
      </td>
      <td>
        {/* {isEditing ? (
          <Controller
            name="device"
            control={control}
            render={({ field }) => (
              <input {...field} style={{minHeight: 20}} />
            )}
          />
        ) : ( */}
        <div className={styles.deviceButton}>{rowData.device}</div>{" "}
        {/* смена устройства */}
        {/* )}  */}
      </td>
      <td className={styles.icon}>
        {isEditing ? (
          <Save onClick={handleSubmit(handleSave)} stroke="#23E70A"/>
        ) : (
          <Edit
            stroke="#23E70A"
            onClick={() => setIsEditing(true)} // Включить режим редактирования
            style={{ cursor: "pointer" }}
          />
        )}
      </td>
      <td className={styles.icon}>
        <Basket stroke="#FF1A43" />
      </td>
    </tr>
  );
};

export default TableRow;
