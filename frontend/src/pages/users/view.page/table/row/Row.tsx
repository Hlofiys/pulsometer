import { FC, ReactNode, useMemo, useState } from "react";
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
import { motion } from "framer-motion";

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
        group: data.group,
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

  const createParticles = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const particles = [];
    const numParticles = 50; // Количество частиц

    for (let i = 0; i < numParticles; i++) {
      const size = Math.random() * 5 + 5; // Размер частицы
      const posX = x + Math.random() * width - width / 2; // Позиция по X
      const posY = y + Math.random() * height - height / 2; // Позиция по Y
      const angle = Math.random() * 360; // Угол движения
      const speed = Math.random() * 10 + 5; // Скорость движения

      particles.push({
        size,
        x: posX,
        y: posY,
        vx: speed * Math.cos((angle * Math.PI) / 180), // Скорость по X
        vy: speed * Math.sin((angle * Math.PI) / 180), // Скорость по Y
      });
    }

    return particles;
  };

  const handleDelete = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement; // Type assertion to HTMLElement

    if (target) {
      // Check if target is not null or undefined
      const rowElement = target.closest("tr"); // Now safe to use closest

      if (rowElement) {
        // Check if rowElement is found
        const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = rowElement;

        const particles = createParticles(
          offsetLeft,
          offsetTop,
          offsetWidth,
          offsetHeight
        );

        // Запускаем анимацию частиц
        particles.forEach((particle, index) => {
          setTimeout(() => {
            const particleElement = document.createElement("div");
            particleElement.style.cssText = `
                        position: absolute;
                        width: ${particle.size}px;
                        height: ${particle.size}px;
                        background-color: #FF1A43; /* Цвет частиц */
                        left: ${particle.x}px;
                        top: ${particle.y}px;
                        transform: translate(${particle.vx * 10}px, ${
              particle.vy * 10
            }px); /* Смещение */
                        opacity: 0;
                        transition: transform 0.5s ease-out, opacity 0.5s ease-out; /* Анимация */
                    `;
            rowElement.appendChild(particleElement); // Используем rowElement

            // Удаляем частицу после анимации
            setTimeout(() => {
              particleElement.remove();
            }, 500);
          }, index * 20); // Задержка между запуском анимации частиц
        });

        try {
          await delete_user(rowData.userId); // Удаляем пользователя после анимации
        } catch (error) {
          console.error("Error deleting user:", error);
          // Обработка ошибки удаления пользователя
        }
      } else {
        console.error("Could not find table row element.");
      }
    } else {
      console.error("Event target is null.");
    }
  };

  const propsInTR = useMemo(() => {
    if (isEdit) {
      return {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0, transition: { duration: 0.5 } },
      };
    }
    return {}; // Возвращаем пустой объект, если isEdit false
  }, [isEdit]);

  return (
    <motion.tr
      className={styles.tableRow}
      onClick={handleRowClick}
      {...propsInTR}
    >
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
                  e.stopPropagation();
                  handleDelete(e);
                }}
              />
            )}
          </td>
        </>
      )}
    </motion.tr>
  );
};

export default TableRow;
