import { useCallback, useMemo, useState } from "react";

interface UsePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  paginatedData: T[];
  handlePageChange: (page: number) => void;
}

export function usePagination<T>(
  data: T[],
  rowsPerPage: number
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / rowsPerPage);
  }, [data.length, rowsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    handlePageChange,
  };
}
