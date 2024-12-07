import { FC, ReactNode, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import styles from "./Row.module.scss";
import Save from "../../../../../ui/icons/Save";
import Edit from "../../../../../ui/icons/Edit";
import Basket from "../../../../../ui/icons/Basket";
import Input from "../../../../../ui/input/primary/PrimaryInput";
import { useDeleteUser } from "../../../../../api/hooks/user/useDeleteUser";
import { useUpdateUser } from "../../../../../api/hooks/user/useUpdateUser";
import { TUpdateUser } from "../../../../../services/interfaces/Interfaces";
import { Spin } from "antd";
import Dropdown from "../../../../../ui/input/dropdown/Dropdown";
import { useParams } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../../../utils/functions/functions";
import { useGetDeviceOptions } from "../../../../../api/hooks/device/useGetDeviceOptions";

interface TableRowProps<T> {
  index: number;
  rowData: T;
  fields: FieldConfig<T>[]; // Конфигурация полей
  onClick?: (row: T) => void; // Обработчик клика
  children?: ReactNode;
  isEdit?: boolean;
}

export interface FieldConfig<T> {
  key: keyof T; // Ключ поля
  label?: string; // Отображаемое имя
  type: "text" | "dropdown"; // Тип поля
  isEditable?: boolean; // Флаг редактируемости
  dropdownOptions?: { label: string; value: any }[]; // Опции для выпадающего списка
  dropdownLoading?: boolean;
  renderStatic?: (value: any) => JSX.Element | string; // Кастомный рендеринг для статичного значения
}

const TableRow: FC<TableRowProps<any>> = (props) => {
  const { index, rowData, fields, onClick, isEdit } = props;
  const { deviceId } = useParams();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { control, handleSubmit, watch } = useForm({
    mode: "onChange",
    defaultValues: rowData,
  });
  const rowValues = watch();

  // const { data: devices, isLoading: isLoadingDevices } = useGetDevices();
  const { devicesOptions, isLoadingDevices } = useGetDeviceOptions();

  const { mutateAsync: delete_user, isLoading: isDeleteLoading } =
    useDeleteUser(Number(deviceId));
  const { mutateAsync: update_user, isLoading: isUpdateLoading } =
    useUpdateUser(Number(deviceId));

  // Сохранение изменений
  const handleSave = (data: any) => {
    const isChanged = fields.some(
      (field) => field.isEditable && data[field.key] !== rowData[field.key]
    );

    if (isChanged) {
      const updateUserData: TUpdateUser = {
        fio: `${data.lastName} ${data.firstName} ${data.middleName}`,
        deviceId: data.deviceId,
        userId: rowData.userId,
      };

      update_user(updateUserData, {
        onSuccess: () => setIsEditing(false),
      });
    } else {
      setIsEditing(false);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Если клик был на интерактивных элементах, выходим
    if (
      target.closest('[data-dropdown="true"]') ||
      target.closest("input") || // Игнорируем инпуты
      target.closest("." + styles.icon) || // Игнорируем иконки
      target.closest("." + styles.deviceButton) // Игнорируем кнопки устройств
    ) {
      return;
    }

    // Выполняем логику клика по строке
    onClick && onClick(rowData);
  };

  return (
    <tr className={styles.tableRow} onClick={handleRowClick}>
      <td>
        <div className={styles.tableIndex}>{index}</div>
      </td>
      {fields.map((field) => (
        <td key={field.key as string}>
          {isEditing && field.isEditable ? (
            <Controller
              name={field.key as string}
              key={field.key as string}
              control={control}
              render={({ field: controllerField }) => {
                const { ref, onChange, ...controlField } = controllerField;

                return field.type === "text" ? (
                  <Input
                    {...controlField}
                    onChange={(event) =>
                      onChange(capitalizeFirstLetter(event.target.value))
                    }
                    style={{ minHeight: 20 }}
                  />
                ) : (
                  <Dropdown
                    value={controllerField.value}
                    onChange={(selectedOption) =>
                      onChange(selectedOption.value)
                    }
                    isHorizontal
                    isLoading={isLoadingDevices}
                    containersStyles={{
                      width: 250,
                      minHeight: 20,
                      padding: "7px 15px",
                    }}
                    options={devicesOptions}
                  />
                );
              }}
            />
          ) : field.renderStatic ? (
            field.renderStatic(rowValues[field.key])
          ) : (
            rowValues[field.key]
          )}
        </td>
      ))}
      {isEdit && (
        <>
          <td className={styles.icon}>
            {isEditing ? (
              isUpdateLoading ? (
                <Spin />
              ) : (
                <Save
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit(handleSave)();
                  }}
                  stroke="#23E70A"
                />
              )
            ) : (
              <Edit
                stroke="#23E70A"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
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
                  delete_user(rowData.userId);
                  e.stopPropagation();
                }}
              />
            )}
          </td>
        </>
      )}
    </tr>
  );
};

export default TableRow;
