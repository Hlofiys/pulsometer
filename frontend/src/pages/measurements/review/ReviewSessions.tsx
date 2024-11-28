import { ChangeEventHandler, FC, useCallback, useMemo, useState } from "react";
import styles from "./ReviewSessions.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import {
  // IMeasurements,
  ISession,
  // TTableUserRow,
} from "../../../services/interfaces/Interfaces";
import { convertMilliseconds, parseDateAndTime } from "../../../utils/functions/functions";
import { useGetUsers } from "../../../api/hooks/user/useGetUsers";
import { Empty, Spin } from "antd";
import { SearchInput } from "../../../ui/input/search/SearchInput";
// import Link from "../../../ui/buttons/link/Link";
// import ArrowRight from "../../../ui/icons/ArrowRight";
import Pagination from "../../../ui/pagination/Pagination";
import Table from "../../users/view.page/table/Table";
import { useGetSessions } from "../../../api/hooks/session/useGetSessions";
import { FieldConfig } from "../../users/view.page/table/row/Row";
import { useGetDeviceOptions } from "../../../api/hooks/device/useGetDeviceOptions";
import { RouterPath } from "../../../router/Router";

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

  const { devicesOptions, isLoadingDevices } = useGetDeviceOptions();

  const fields: FieldConfig<ISessionUserRow>[] = [
    { key: "lastName", label: "Фамилия", type: "text" },
    { key: "firstName", label: "Имя", type: "text" },
    { key: "middleName", label: "Отчество", type: "text" },
    {
      key: "time",
      label: "Начало",
      type: "text",
      renderStatic: (value: string) => parseDateAndTime(value).format,
    },
    {
      key: "passed",
      label: "Продолжительность",
      type: "text",
      renderStatic: (value)=> convertMilliseconds(value).formatNumberTime
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

  const { data: users, isLoading: isLoadingGetUsers } = useGetUsers();
  const { data: sessions, isLoading: isLoadingGetSessions } = useGetSessions(
    +userId!
  );
  // : { data: [], isLoading: false };

  // Отфильтрованные данные на основе поиска
  const filteredData: ISession[] = useMemo(() => {
    return (
      (sessions?.data || []).filter((session) => {
        const { default: defaultDate, format } = parseDateAndTime(session.time);
        const formatDateAndTime = format.toLowerCase();
        const defaultDateAndTime = defaultDate.toLowerCase();
        return (
          formatDateAndTime.includes(searchValue.toLowerCase()) ||
          defaultDateAndTime.includes(searchValue.toLowerCase())
        );
      }) || []
    );
  }, [searchValue, sessions, users]);

  // Общий подсчет страниц на основе количества строк
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / ROWS_PER_PAGE);
  }, [filteredData]);

  // Данные для отображения на текущей странице
  const paginatedData: ISessionUserRow[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData
      .sort(
        (sessionPrev, sessionNext) =>
          sessionNext?.sessionId - sessionPrev?.sessionId
      )
      .map((session, index) => {
        const { userId, time, passed, sessionId } = session;
        const activeUser = users?.data.find((user) => user.userId === +userId!);
        const [lastName, firstName, middleName] = (activeUser?.fio || "").split(
          " "
        );

        return {
          lastName: lastName || "",
          middleName: middleName || "",
          firstName: firstName || "",
          sessionIndex: index+1,
          sessionId,
          time,
          passed,
          deviceId: activeUser?.deviceId || 0,
          userId
        };
      })
      .slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredData, currentPage, users]);

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
    <div className={styles.reviewContainer}>
      <h1>Все сессии измерений пользователя:</h1>

      {!!paginatedData.length && (
        <div className={styles.search}>
          <p>Введите дату или время:</p>
          <SearchInput
            searchValueState={[searchValue, setSearchValue]}
            inputProps={{ onChange: onSearch }}
          />
        </div>
      )}
      {isLoadingGetSessions || isLoadingGetUsers ? (
        <Spin />
      ) : paginatedData.length ? (
        <Table<ISessionUserRow>
          // onClick={(row)=>console.log(row)}
          onClick={(row)=>nav(`${RouterPath.REVIEW_MEASUREMENTS}/${row.userId}/${row.sessionId}/${row.time}`)}
          data={paginatedData}
          fields={fields}
          getKey={(row) => row.sessionIndex}
          // getIndex={(number) => ++number}
        />
      ) : (
        <Empty
          description={
            <p className={styles.emptyParagraph}>Список пользователей пуст</p>
          }
        />
      )}
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

// import React from 'react'

// const ReviewMeasurements = () => {
//   return (
//     <div>ReviewMeasurements</div>
//   )
// }

// export default ReviewMeasurements
