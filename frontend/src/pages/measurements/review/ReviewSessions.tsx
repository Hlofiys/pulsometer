import { ChangeEventHandler, FC, useCallback, useMemo, useState } from "react";
import styles from "./ReviewSessions.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { ISession } from "../../../services/interfaces/Interfaces";
import {
  convertMilliseconds,
  formatDateUser,
  parseUTCDateAndTime,
} from "../../../utils/functions/functions";
import { Spin } from "antd";
import { SearchInput } from "../../../ui/input/search/SearchInput";
import Pagination from "../../../ui/pagination/Pagination";
import Table from "../../users/view.page/table/Table";
import { useGetSessions } from "../../../api/hooks/session/useGetSessions";
import { FieldConfig } from "../../users/view.page/table/row/Row";
import { useGetDeviceOptions } from "../../../api/hooks/device/useGetDeviceOptions";
import { RouterPath } from "../../../router/Router";
import Button from "../../../ui/buttons/additional/Button";
import { useGetUserById } from "../../../api/hooks/user/useGetUserById";
import Empty from "../../../ui/empty/Empty";
import Link from "../../../ui/buttons/link/Link";
import ArrowRight from "../../../ui/icons/ArrowRight";

const ROWS_PER_PAGE = 5;

interface ISessionUserRow {
  sessionIndex: number;
  sessionId: number;
  lastName: string;
  firstName: string;
  middleName: string;
  time: string;
  passed: number;
  deviceId: number;
  userId: number;
}
const ReviewSessions: FC = () => {
  const { id: userId } = useParams();
  const nav = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { devicesOptions, isLoadingDevices, devices } = useGetDeviceOptions();

  const fields: FieldConfig<ISessionUserRow>[] = [
    { key: "lastName", label: "Фамилия", type: "text" },
    { key: "firstName", label: "Имя", type: "text" },
    { key: "middleName", label: "Отчество", type: "text" },
    {
      key: "time",
      label: "Начало",
      type: "text",
      renderStatic: (date: string) => formatDateUser(date).short,
    },
    {
      key: "passed",
      label: "Продолжительность",
      type: "text",
      renderStatic: (value) =>
        convertMilliseconds({ ms: value }).formatNumberTime,
    },
    {
      key: "deviceId",
      label: "Устройство",
      type: "dropdown",
      dropdownOptions: devicesOptions,
      dropdownLoading: isLoadingDevices,
      renderStatic: (value: any) => (
        <div className={styles.deviceButton}>Пульсометр #{value}</div>
      ),
    },
  ];

  const { data: activeUser, isLoading: isLoadingActiveUser } = useGetUserById(
    +userId!
  );
  const { data: sessions, isLoading: isLoadingGetSessions } = useGetSessions(
    +userId!
  );

  // Отфильтрованные данные на основе поиска
  const filteredData: ISession[] = useMemo(() => {
    return (
      ((sessions && sessions) || []).filter((session) => {
        const { default: defaultDate, belarusian } = parseUTCDateAndTime(
          session.time
        );
        const formatDateAndTime = belarusian.toLowerCase();
        const defaultDateAndTime = defaultDate.toLowerCase();
        return (
          formatDateAndTime.includes(searchValue.toLowerCase()) ||
          defaultDateAndTime.includes(searchValue.toLowerCase())
        );
      }) || []
    );
  }, [searchValue, sessions]);

  // Общий подсчет страниц на основе количества строк
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / ROWS_PER_PAGE);
  }, [filteredData]);

  // Данные для отображения на текущей странице
  const paginatedData: ISessionUserRow[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    // console.log(filteredData)
    return filteredData
      .sort(
        (sessionPrev, sessionNext) =>
          sessionNext?.sessionId - sessionPrev?.sessionId
      )
      .map((session, index) => {
        const { userId, time, passed, sessionId } = session;
        const [lastName, firstName, middleName] = (
          activeUser?.data.fio || ""
        ).split(" ");

        return {
          lastName: lastName || "",
          middleName: middleName || "",
          firstName: firstName || "",
          sessionIndex: index + 1,
          sessionId,
          time,
          passed,
          deviceId: activeUser?.data.deviceId || 0,
          userId,
        };
      })
      .slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredData, currentPage, activeUser]);

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
    () =>
      devices?.find((device) => device.deviceId === activeUser?.data.deviceId),
    [devices, activeUser?.data]
  );

  const isButtonDisabled = useMemo(
    () => ["off", "measuring"].includes(activeDevice?.status || ""),
    [activeDevice]
  );

  return (
    <div className={styles.reviewContainer}>
      <h1>Все сессии измерений пользователя:</h1>

      <div className={styles.search}>
        <p>Введите дату или время:</p>
        <div className={styles.form}>
          <SearchInput
            searchValueState={[searchValue, setSearchValue]}
            inputProps={{ onChange: onSearch }}
          />
          <Button
            disabled={isButtonDisabled || isLoadingActiveUser}
            name={
              isButtonDisabled ? "Устройство выключено" : "Начать измерения"
            }
            onClick={() =>
              nav(
                RouterPath.START_MEASUREMENTS +
                  `/${activeUser?.data.deviceId}/${userId}`
              )
            }
          >
            Начать измерение
          </Button>
        </div>
      </div>
      {isLoadingGetSessions || isLoadingActiveUser ? (
        <Spin />
      ) : paginatedData.length ? (
        <Table<ISessionUserRow>
          onClick={(row) =>
            nav(`${RouterPath.REVIEW_MEASUREMENTS}/${row.sessionId}`)
          }
          data={paginatedData}
          fields={fields}
          getKey={(row) => row.sessionIndex}
        />
      ) : (
        <Empty description="Список измерений пуст" />
      )}
      <Link onClick={() => nav(RouterPath.VIEW)}>
        Перейти к пользователям <ArrowRight stroke="#23E70A" />
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

export default ReviewSessions;
