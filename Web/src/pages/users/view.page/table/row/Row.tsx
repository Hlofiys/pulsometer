import { FC, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import styles from "./Row.module.scss";
import Basket from "../../../../../ui/icons/Basket";
import Edit from "../../../../../ui/icons/Edit";
import Input from "../../../../../ui/input/primary/PrimaryInput";
import Save from "../../../../../ui/icons/Save";
import { useDeleteUser } from "../../../../../api/hooks/user/useDeleteUser";
import { useUpdateUser } from "../../../../../api/hooks/user/useUpdateUser";
import { TUpdateUser } from "../../../../../services/interfaces/Interfaces";
import { Spin } from "antd";

interface TableRowProps {
  index: number;
  rowData: TableRowFormValues;
  onClick?: (value: string | number) => void;
  onSave?: (data: TableRowFormValues) => void; // Функция сохранения изменений
}

export interface TableRowFormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  deviceId: number;
  userId: number;
}

const TableRow: FC<TableRowProps> = (props) => {
  const { index, rowData, onSave, onClick } = props;

  const [isEditing, setIsEditing] = useState(false);
  const { control, handleSubmit } = useForm<TableRowFormValues>({
    defaultValues: rowData,
  });

  const { mutateAsync: delete_user, isLoading: isDeleteLoading } =
    useDeleteUser();
  const { mutateAsync: update_user, isLoading: isUpdateLoading } =
    useUpdateUser();

  // Сохранение изменений
  const handleSave = (data: TableRowFormValues) => {
    const { lastName, firstName, middleName, userId, deviceId } = data;
    const updateUserData: TUpdateUser = {
      fio: `${lastName} ${firstName} ${middleName}`,
      deviceId,
      id: userId,
    };
    update_user(updateUserData, {
      onSuccess: () => {
        setIsEditing(false); // Отключить режим редактирования
        onSave && onSave(data); // Передать данные в родительский компонент
      },
    });
  };

  const handleDelete = (data: TableRowFormValues) => {
    delete_user(data.userId);
  };

  // Обработчик клика по строке
  const handleRowClick = (e: React.MouseEvent) => {
    // Проверим, не кликнули ли мы по кнопке редактирования или удаления
    const target = e.target as HTMLElement;
    if (
      target.closest("." + styles.icon) ||
      target.closest("." + styles.deviceButton)
    ) {
      // Не выполняем действие, если кликнули по кнопке
      return;
    }
    // Если не кликнули по кнопке, вызываем onClick
    onClick && onClick(rowData.userId);
  };

  return (
    <tr
      className={styles.tableRow}
      onClick={handleRowClick} // Обработчик клика по строке
    >
      <td>
        <div className={styles.tableIndex}>{index}</div>
      </td>
      <td>
        {isEditing ? (
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input {...field} style={{ minHeight: 20 }} />
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
              <Input {...field} style={{ minHeight: 20 }} />
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
              <Input {...field} style={{ minHeight: 20 }} />
            )}
          />
        ) : (
          rowData.middleName
        )}
      </td>
      <td>
        <div className={styles.deviceButton}>
          Пульсометр #{rowData.deviceId}
        </div>
      </td>
      <td className={styles.icon}>
        {isEditing ? (
          isUpdateLoading ? (
            <Spin />
          ) : (
            <Save
              onClick={(e) => {
                e.stopPropagation(); // Останавливаем всплытие события
                handleSubmit(handleSave)(e);
              }}
              stroke="#23E70A"
            />
          )
        ) : (
          <Edit
            stroke="#23E70A"
            onClick={(e) => {
              e.stopPropagation(); // Останавливаем всплытие события
              setIsEditing(true); // Включить режим редактирования
            }}
            style={{ cursor: "pointer" }}
          />
        )}
      </td>
      <td className={styles.icon}>
        {isDeleteLoading ? (
          <Spin />
        ) : (
          <Basket
            stroke="#FF1A43"
            onClick={(e) => {
              e.stopPropagation(); // Останавливаем всплытие события
              handleSubmit(handleDelete)(e);
            }}
          />
        )}
      </td>
    </tr>
  );
};

export default TableRow;
