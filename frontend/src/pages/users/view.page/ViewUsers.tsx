import { ChangeEventHandler, FC, useCallback, useMemo, useState } from "react";
import styles from "./ViewUsers.module.scss";
import Table from "./table/Table";
import { SearchInput } from "../../../ui/input/search/SearchInput";
import Link from "../../../ui/buttons/link/Link";
import { useNavigate, useParams } from "react-router-dom";
import ArrowRight from "../../../ui/icons/ArrowRight";
import Pagination from "../../../ui/pagination/Pagination";
import { useGetUsers } from "../../../api/hooks/user/useGetUsers";
import { Empty, Spin } from "antd";
import { TTableUserRow } from "../../../services/interfaces/Interfaces";
// import { TableRowFormValues } from "./table/row/Row";
import { useGetUsersByDeviceId } from "../../../api/hooks/device/useGetUsersByDeviceId";
import { FieldConfig } from "./table/row/Row";
// import { useGetDevices } from "../../../api/hooks/device/useGetDevices";
import { useGetDeviceOptions } from "../../../api/hooks/device/useGetDeviceOptions";
import Basket from "../../../ui/icons/Basket";
import Edit from "../../../ui/icons/Edit";
import Save from "../../../ui/icons/Save";
import { RouterPath } from "../../../router/Router";

const ROWS_PER_PAGE = 5; // Максимальное количество строк на одной странице

export interface IAllUsersTableRow {
  lastName: string;
  middleName: string;
  firstName: string;
  userId: number;
  deviceId: number;
}

/*
const [isEditing, setIsEditing] = useState(false);
const { mutateAsync: delete_user, isLoading: isDeleteLoading } =
useDeleteUser();
const { mutateAsync: update_user, isLoading: isUpdateLoading } =
  useUpdateUser();

// Сохранение изменений
const handleSave = (data: any) => {
  const { lastName, firstName, middleName, userId, deviceId } = data;

  const isChanged =
    lastName !== initialData.lastName ||
    firstName !== initialData.firstName ||
    middleName !== initialData.middleName ||
    deviceId !== initialData.deviceId;

  if (isChanged) {
    const updateUserData: TUpdateUser = {
      fio: `${lastName} ${firstName} ${middleName}`,
      deviceId,
      userId,
    };
    update_user(updateUserData, {
      onSuccess: () => {
        setInitialData(data); // Обновляем исходные данные
        setIsEditing(false); // Отключить режим редактирования
        onSave && onSave(data); // Передать данные в родительский компонент
      },
    });
  } else {
    setIsEditing(false); // Выходим из режима редактирования без сохранения
  }
};

const handleDelete = (data: any) => {
  delete_user(data.userId);
};
*/

const ViewUsers: FC = () => {
  const nav = useNavigate();
  const { deviceId } = useParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isEditing, setIsEditing] = useState(false);

  const { data: fetchedUsers, isLoading } = !!deviceId
    ? useGetUsersByDeviceId(+deviceId)
    : useGetUsers();
  const { devicesOptions, isLoadingDevices } = useGetDeviceOptions();

  const fields: FieldConfig<IAllUsersTableRow>[] = [
    { key: "lastName", label: "Фамилия", type: "text" },
    { key: "firstName", label: "Имя", type: "text" },
    { key: "middleName", label: "Отчество", type: "text" },
    {
      key: "deviceId",
      label: "Устройство",
      type: "dropdown",
      dropdownOptions: devicesOptions,
      dropdownLoading: isLoadingDevices,
      renderStatic: (value: any) => <div>Пульсометр #{value}</div>,
    },
  ];

  // Отфильтрованные данные на основе поиска
  const filteredData: TTableUserRow[] = useMemo(() => {
    return (
      (fetchedUsers?.data || []).filter((user) => {
        const fio = user.fio.toLowerCase();
        return fio.includes(searchValue.toLowerCase());
      }) || []
    );
  }, [searchValue, fetchedUsers, deviceId]);

  // Общий подсчет страниц на основе количества строк
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / ROWS_PER_PAGE);
  }, [filteredData]);

  // Данные для отображения на текущей странице
  const paginatedData: IAllUsersTableRow[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return (
      filteredData
        .sort((userPrev, userNext) => userPrev?.userId - userNext?.userId)
        .map((user) => {
          const { fio, userId, deviceId } = user;
          const [lastName, firstName, middleName] = fio.split(" ");

          return {
            lastName: lastName || "",
            middleName: middleName || "",
            firstName: firstName || "",
            userId,
            deviceId,
          };
        })
        .slice(startIndex, startIndex + ROWS_PER_PAGE) || []
    );
  }, [filteredData, currentPage]);

  const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setSearchValue(event.target.value);
      setCurrentPage(1); // Сбрасываем на первую страницу при поиске
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className={styles.viewContainer}>
      <h1>Все пользователи:</h1>
      {!!paginatedData.length && (
        <SearchInput
          searchValueState={[searchValue, setSearchValue]}
          inputProps={{ onChange: onSearch }}
        />
      )}
      {isLoading ? (
        <Spin />
      ) : !!paginatedData.length ? (
        <Table<IAllUsersTableRow>
          onClick={(row) => nav(`/review-sessions/${row.userId}`)}
          data={paginatedData}
          fields={fields}
          getKey={(row) => row.userId}
        >
          <>
            <td className={styles.icon}>
              {isEditing ? (
                <Save
                  onClick={(e) => {
                    e.stopPropagation();
                    // onSave && onSave(rowData);
                    // handleSubmit(handleSave)();
                  }}
                  stroke="#23E70A"
                />
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
              <Basket
                stroke="#FF1A43"
                onClick={(e) => {
                  e.stopPropagation();
                  // onDelete && onDelete(rowData.userId);
                  // handleDelete();
                }}
              />
            </td>
          </>
        </Table>
      ) : (
        <Empty
          description={
            <p className={styles.emptyParagraph}>Список пользователей пуст</p>
          }
        />
      )}
      <Link onClick={() => nav(RouterPath.CREATE)}>
        Добавить пользователя <ArrowRight stroke="#23E70A" />
      </Link>
      <Pagination
        containerStyles={{ width: "100%", justifyContent: "center" }}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ViewUsers;
