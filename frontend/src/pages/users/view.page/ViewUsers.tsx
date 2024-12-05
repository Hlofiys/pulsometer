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
import { RouterPath } from "../../../router/Router";
import Button from "../../../ui/buttons/additional/Button";

const ROWS_PER_PAGE = 5; // Максимальное количество строк на одной странице

export interface IAllUsersTableRow {
  index: number;
  lastName: string;
  middleName: string;
  firstName: string;
  userId: number;
  deviceId: number;
}

const ViewUsers: FC = () => {
  const nav = useNavigate();
  const { deviceId } = useParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: fetchedUsers, isLoading } = !!deviceId
    ? useGetUsersByDeviceId(+deviceId)
    : useGetUsers();
  const { devicesOptions, isLoadingDevices, devices } = useGetDeviceOptions();

  const fields: FieldConfig<IAllUsersTableRow>[] = useMemo(
    () => [
      { key: "lastName", label: "Фамилия", type: "text", isEditable: true },
      { key: "firstName", label: "Имя", type: "text", isEditable: true },
      { key: "middleName", label: "Отчество", type: "text", isEditable: true },
      {
        key: "deviceId",
        label: "Устройство",
        type: "dropdown",
        dropdownOptions: devicesOptions,
        dropdownLoading: isLoadingDevices,
        renderStatic: (value: any) => <div>Пульсометр #{value}</div>,
        isEditable: true,
      },
    ],
    [devicesOptions]
  );

  // Отфильтрованные данные на основе поиска
  const filteredData: TTableUserRow[] = useMemo(() => {
    return (
      (fetchedUsers?.data || []).filter((user) => {
        const fio = user.fio.toLowerCase();
        return fio.includes(searchValue.toLowerCase());
      }) || []
    );
  }, [searchValue, fetchedUsers?.data, deviceId]);

  // Общий подсчет страниц на основе количества строк
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / ROWS_PER_PAGE);
  }, [filteredData]);

  // Данные для отображения на текущей странице
  const paginatedData: IAllUsersTableRow[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return (
      (!!filteredData.length ? filteredData : [])
        .sort((userPrev, userNext) => userPrev?.userId - userNext?.userId)
        .map((user, index) => {
          const { fio, userId, deviceId } = user;
          const [lastName, firstName, middleName] = fio.split(" ");

          return {
            index,
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

  const activeDevice = useMemo(
    () => devices?.find((device) => device.deviceId === +deviceId!),
    [devices]
  );

  const isButtonDisabled = useMemo(
    () => ["off", "measuring"].includes(activeDevice?.status || ""),
    [activeDevice]
  );

  return (
    <div className={styles.viewContainer}>
      <h1>Все пользователи:</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <SearchInput
          searchValueState={[searchValue, setSearchValue]}
          inputProps={{ onChange: onSearch }}
        />
        {!!deviceId && (
          <Button
            style={{ height: 50 }}
            disabled={isButtonDisabled}
            name={
              isButtonDisabled ? "Устройство выключено" : "Начать измерения"
            }
            onClick={() => nav(RouterPath.START_MEASUREMENTS + `/${deviceId}`)}
          >
            Начать измерение
          </Button>
        )}
      </div>
      {isLoading ? (
        <Spin />
      ) : !!paginatedData.length ? (
        <Table<IAllUsersTableRow>
          onClick={(row) => nav(`/review-sessions/${row.userId}`)}
          data={paginatedData}
          fields={fields}
          isEdit
          getKey={(row) => row.userId}
          getIndex={(row) => row.index + 1}
        />
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
