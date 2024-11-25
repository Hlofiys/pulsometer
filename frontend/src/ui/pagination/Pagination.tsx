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
  if (totalPages <= 1) return null; // Если страниц <= 1, пагинация не отображается

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
    const range = 2; // Количество видимых страниц слева и справа от текущей

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
    <div className={styles.pagination} style={containerStyles}>
      <ArrowLeft
        className={styles.paginationArrow}
        onClick={() => handlePageClick(currentPage - 1)}
        aria-disabled={currentPage === 1}
      />
      {getPages().map((page) => (
        <button
          key={page}
          className={`${styles.paginationItem} ${
            page === currentPage ? styles.active : ""
          }`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}

      <ArrowRight
        className={styles.paginationArrow}
        onClick={() => handlePageClick(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
      />
    </div>
  );
};

export default Pagination;
