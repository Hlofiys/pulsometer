import React, { CSSProperties, useCallback } from "react";
import styles from "./Pagination.module.scss";
import ArrowRight from "../icons/ArrowRight";
import ArrowLeft from "../icons/ArrowLeft";

interface PaginationProps {
  containerStyles?: CSSProperties;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  containerStyles,
  totalPages,
  currentPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePageClick = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    },
    [onPageChange, totalPages, currentPage]
  );

  const getPages = useCallback(() => {
    const pages: number[] = [];
    const range = 2;

    for (
      let i = Math.max(1, currentPage - range);
      i <= Math.min(totalPages, currentPage + range);
      i++
    ) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <nav
      className={styles.pagination}
      style={containerStyles}
      aria-label="Навигация по страницам"
    >
      <button
        className={styles.paginationArrow}
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Предыдущая страница"
        type="button"
      >
        <ArrowLeft stroke={currentPage === 1 ? "#4b5563" : "#9ca3af"} />
      </button>

      {getPages().map((page) => (
        <button
          key={page}
          className={`${styles.paginationItem} ${
            page === currentPage ? styles.active : ""
          }`}
          onClick={() => handlePageClick(page)}
          aria-current={page === currentPage ? "page" : undefined}
          aria-label={`Страница ${page}`}
          type="button"
        >
          {page}
        </button>
      ))}

      <button
        className={styles.paginationArrow}
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Следующая страница"
        type="button"
      >
        <ArrowRight stroke={currentPage === totalPages ? "#4b5563" : "#9ca3af"} />
      </button>
    </nav>
  );
};

export default Pagination;
