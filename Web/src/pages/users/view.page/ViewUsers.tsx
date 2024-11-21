import { ChangeEventHandler, FC, useCallback, useMemo, useState } from "react";
import styles from "./ViewUsers.module.scss";
import Table, { ITableRow } from "./table/Table";
import { SearchInput } from "../../../ui/input/search/SearchInput";
import Link from "../../../ui/buttons/link/Link";
import { useNavigate } from "react-router-dom";
import ArrowRight from "../../../ui/icons/ArrowRight";
import Pagination from "../../../ui/pagination/Pagination";

const data: ITableRow[] = [
  {
    id: 1,
    lastName: "Корнеева",
    firstName: "Анжелика",
    middleName: "Фёдоровна",
    age: 25,
    date: "17 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 2,
    lastName: "Кирик",
    firstName: "Константин",
    middleName: "Андреевич",
    age: 18,
    date: "10 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 3,
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "Иванович",
    age: 30,
    date: "1 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 4,
    lastName: "Петрова",
    firstName: "Мария",
    middleName: "Сергеевна",
    age: 22,
    date: "5 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 5,
    lastName: "Смирнов",
    firstName: "Алексей",
    middleName: "Владимирович",
    age: 28,
    date: "12 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 6,
    lastName: "Кузнецова",
    firstName: "Екатерина",
    middleName: "Петровна",
    age: 24,
    date: "7 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 7,
    lastName: "Соколов",
    firstName: "Михаил",
    middleName: "Дмитриевич",
    age: 35,
    date: "8 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 8,
    lastName: "Ковалёва",
    firstName: "Дарья",
    middleName: "Александровна",
    age: 20,
    date: "6 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 9,
    lastName: "Орлов",
    firstName: "Виктор",
    middleName: "Сергеевич",
    age: 40,
    date: "14 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 10,
    lastName: "Зайцева",
    firstName: "Ольга",
    middleName: "Михайловна",
    age: 26,
    date: "11 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 11,
    lastName: "Морозов",
    firstName: "Сергей",
    middleName: "Анатольевич",
    age: 32,
    date: "3 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 12,
    lastName: "Киселёва",
    firstName: "Елена",
    middleName: "Викторовна",
    age: 19,
    date: "9 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 13,
    lastName: "Новиков",
    firstName: "Денис",
    middleName: "Алексеевич",
    age: 23,
    date: "4 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 14,
    lastName: "Макарова",
    firstName: "Вера",
    middleName: "Игоревна",
    age: 27,
    date: "13 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 15,
    lastName: "Захаров",
    firstName: "Григорий",
    middleName: "Николаевич",
    age: 36,
    date: "2 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 16,
    lastName: "Тихонова",
    firstName: "Светлана",
    middleName: "Евгеньевна",
    age: 29,
    date: "15 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 17,
    lastName: "Крылов",
    firstName: "Олег",
    middleName: "Юрьевич",
    age: 21,
    date: "16 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 18,
    lastName: "Фролова",
    firstName: "Татьяна",
    middleName: "Константиновна",
    age: 31,
    date: "18 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 19,
    lastName: "Романов",
    firstName: "Андрей",
    middleName: "Вячеславович",
    age: 34,
    date: "20 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 20,
    lastName: "Волкова",
    firstName: "Анна",
    middleName: "Олеговна",
    age: 22,
    date: "19 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 21,
    lastName: "Егоров",
    firstName: "Юрий",
    middleName: "Павлович",
    age: 33,
    date: "21 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 22,
    lastName: "Лебедева",
    firstName: "Алина",
    middleName: "Максимовна",
    age: 20,
    date: "22 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 23,
    lastName: "Григорьев",
    firstName: "Игорь",
    middleName: "Александрович",
    age: 37,
    date: "23 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 24,
    lastName: "Шмелева",
    firstName: "Маргарита",
    middleName: "Юрьевна",
    age: 28,
    date: "24 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 25,
    lastName: "Семенов",
    firstName: "Виталий",
    middleName: "Романович",
    age: 35,
    date: "25 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 26,
    lastName: "Тимофеева",
    firstName: "Людмила",
    middleName: "Владимировна",
    age: 26,
    date: "26 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 27,
    lastName: "Николаев",
    firstName: "Дмитрий",
    middleName: "Евгеньевич",
    age: 24,
    date: "27 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 28,
    lastName: "Михайлова",
    firstName: "Валентина",
    middleName: "Игоревна",
    age: 30,
    date: "28 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 29,
    lastName: "Белов",
    firstName: "Аркадий",
    middleName: "Викторович",
    age: 38,
    date: "29 ноября 2024 г.",
    device: "Пульсометр",
  },
  {
    id: 30,
    lastName: "Галкина",
    firstName: "Елизавета",
    middleName: "Сергеевна",
    age: 27,
    date: "30 ноября 2024 г.",
    device: "Пульсометр",
  },
];

const ROWS_PER_PAGE = 5; // Максимальное количество строк на одной странице

const ViewUsers: FC = () => {
  const nav = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Отфильтрованные данные на основе поиска
  const filteredData: ITableRow[] = useMemo(() => {
    return data.filter((el) => {
      const fio =
        `${el.lastName} ${el.firstName} ${el.middleName}`.toLowerCase();
      return fio.includes(searchValue.toLowerCase());
    });
  }, [searchValue]);

  // Общий подсчет страниц на основе количества строк
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / ROWS_PER_PAGE);
  }, [filteredData]);

  // Данные для отображения на текущей странице
  const paginatedData: ITableRow[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ROWS_PER_PAGE);
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
      <Table data={paginatedData} />
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
