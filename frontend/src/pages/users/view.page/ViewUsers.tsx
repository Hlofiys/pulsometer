import { ChangeEventHandler, FC, useCallback, useMemo, useState } from "react";
import styles from "./ViewUsers.module.scss";
import Table from "./table/Table";
import { SearchInput } from "../../../ui/input/search/SearchInput";
import Link from "../../../ui/buttons/link/Link";
import { useNavigate } from "react-router-dom";
import ArrowRight from "../../../ui/icons/ArrowRight";
import Pagination from "../../../ui/pagination/Pagination";
import { useGetUsers } from "../../../api/hooks/user/useGetUsers";
import { Spin } from "antd";
import { TTableUserRow } from "../../../services/interfaces/Interfaces";
import { TableRowFormValues } from "./table/row/Row";

const ROWS_PER_PAGE = 5; // Максимальное количество строк на одной странице

const ViewUsers: FC = () => {
  const nav = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: users, isLoading: isLoadingGetUsers } = useGetUsers();

  // Отфильтрованные данные на основе поиска
  const filteredData: TTableUserRow[] = useMemo(() => {
    return (
      users?.data.filter((user) => {
        const fio = user.fio.toLowerCase();
        return fio.includes(searchValue.toLowerCase());
      }) || []
    );
  }, [searchValue, users]);

  // Общий подсчет страниц на основе количества строк
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / ROWS_PER_PAGE);
  }, [filteredData]);

  // Данные для отображения на текущей странице
  const paginatedData: TableRowFormValues[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData
      .sort((userPrev, userNext) => userPrev?.id - userNext?.id)
      .map((user) => {
        const { fio, id, deviceId } = user;
        const [lastName, firstName, middleName] = fio.split(" ");

        return {
          lastName: lastName || "",
          middleName: middleName || "",
          firstName: firstName || "",
          userId: id,
          deviceId,
        };
      })
      .slice(startIndex, startIndex + ROWS_PER_PAGE);
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
      <SearchInput
        searchValueState={[searchValue, setSearchValue]}
        inputProps={{ onChange: onSearch }}
      />
      {isLoadingGetUsers ? <Spin /> : <Table onClick={(value: string|number)=>nav(`/review-measurements/${value}`)} data={paginatedData} />}
      <Link onClick={() => nav("/create")}>
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
