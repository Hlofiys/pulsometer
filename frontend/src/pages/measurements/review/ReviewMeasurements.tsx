// import { FC, useCallback, useMemo, useState } from "react";
// import styles from "./ReviewMeasurements.module.scss";
// import { useNavigate, useParams } from "react-router-dom";
// import { useGetMeasurementsById } from "../../../api/hooks/user/useGetMeasurements";
// import {
//   IMeasurements,
//   TTableUserRow,
// } from "../../../services/interfaces/Interfaces";
// import { parseDateAndTime } from "../../../utils/functions/functions";
// import { useGetUsers } from "../../../api/hooks/user/useGetUsers";
// import { Spin } from "antd";
// import { SearchInput } from "../../../ui/input/search/SearchInput";
// import Link from "../../../ui/buttons/link/Link";
// import ArrowRight from "../../../ui/icons/ArrowRight";
// import Pagination from "../../../ui/pagination/Pagination";
// import Table from "../../users/view.page/table/Table";

// const ROWS_PER_PAGE = 5;

// const ReviewMeasurements: FC = () => {
//   const { id: userId } = useParams();
//   const nav = useNavigate();
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState<number>(1);

//   const { data: measurements, isLoading: isLoadingGetMeasurements } =
//     useGetMeasurementsById((userId && +userId) || 0);
//     const {data: users, isLoading: isLoadingGetUsers} = useGetUsers();
//   // : { data: [], isLoading: false };

//   // Отфильтрованные данные на основе поиска
//   const filteredData: TTableMeasurementRow[] = useMemo(() => {
//     return (
//       measurements?.data.filter((measurement) => {
//         const { default: defaultDate, format } = parseDateAndTime(
//           measurement.date
//         );
//         const formatDateAndTime = format.toLowerCase();
//         const defaultDateAndTime = defaultDate.toLowerCase();
//         return (
//           formatDateAndTime.includes(searchValue.toLowerCase()) ||
//           defaultDateAndTime.includes(searchValue.toLowerCase())
//         );
//       }) || []
//     );
//   }, [searchValue, measurements, users]);

//   // Общий подсчет страниц на основе количества строк
//   const totalPages = useMemo(() => {
//     return Math.ceil(filteredData.length / ROWS_PER_PAGE);
//   }, [filteredData]);

//   // Данные для отображения на текущей странице
//   const paginatedData: TTableMeasurementRow[] = useMemo(() => {
//     const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
//     return filteredData
//       .sort((measPrev, measNext) => measPrev?.id - measNext?.id)
//       .map((meas) => {
//         const { fio, id, deviceId } = meas;
//         const [lastName, firstName, middleName] = fio.split(" ");

//         return {
//           lastName: lastName || "",
//           middleName: middleName || "",
//           firstName: firstName || "",
//           userId: id,
//           deviceId,
//         };
//       })
//       .slice(startIndex, startIndex + ROWS_PER_PAGE);
//   }, [filteredData, currentPage]);

//   const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
//     (event) => {
//       setSearchValue(event.target.value);
//       setCurrentPage(1); // Сбрасываем на первую страницу при поиске
//     },
//     []
//   );

//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page);
//   }, []);

//   return (
//     <div className={styles.reviewContainer}>
//       <h1>Все измерения:</h1>
//       <SearchInput
//         searchValueState={[searchValue, setSearchValue]}
//         inputProps={{ onChange: onSearch }}
//       />
//       {isLoadingGetUsers || isLoadingGetMeasurements ? (
//         <Spin />
//       ) : (
//         <Table
//         //   onClick={(value: string | number) =>
//         //     nav(`/review-measurements/${value}`)
//         //   }
//           data={paginatedData}
//         />
//       )}
//       {/* <Link onClick={() => nav("/create")}>
//         Добавить пользователя <ArrowRight stroke="#23E70A" />
//       </Link> */}
//       <Pagination
//         containerStyles={{ width: "100%", justifyContent: "center" }}
//         totalPages={totalPages}
//         currentPage={currentPage}
//         onPageChange={handlePageChange}
//       />
//     </div>
//   );
// };

// export default ReviewMeasurements;

// import React from 'react'

const ReviewMeasurements = () => {
  return (
    <div>ReviewMeasurements</div>
  )
}

export default ReviewMeasurements