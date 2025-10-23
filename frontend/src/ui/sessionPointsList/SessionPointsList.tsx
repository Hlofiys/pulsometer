import { FC, useState, useMemo, useCallback } from "react";
import styles from "./SessionPointsList.module.scss";
import { ISessionPoint } from "../../services/interfaces/Interfaces";
import Basket from "../icons/Basket";
import Empty from "../empty/Empty";
import Pagination from "../pagination/Pagination";
import { useDeleteKeypoint } from "../../api/hooks/session/useDeleteKeypoint";
import Button from "../buttons/additional/Button";
import { useHoverKeypont } from "../../context/hoverKeypoint/HoverKeypointContext";

interface SessionPointListProps {
  points: ISessionPoint[];
  //   onmouse
  itemsPerPage?: number; // количество элементов на страницу
}

const SessionPointList: FC<SessionPointListProps> = ({
  points,
  itemsPerPage = 7,
}) => {
  const { handleMouseEnter, handleMouseLeave } = useHoverKeypont();
  const { mutateAsync: delete_keypoint, isLoading: isLoadingDeleting } =
    useDeleteKeypoint();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Вычисляем текущие элементы для страницы
  const paginatedPoints = useMemo(() => {
    // Копируем массив и сортируем по startMeasurementId
    const sortedPoints = [...points].sort(
      (a, b) => a.startMeasurementId - b.startMeasurementId
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedPoints.slice(startIndex, endIndex);
  }, [currentPage, points, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(points.length / itemsPerPage),
    [points, itemsPerPage]
  );

  const handleDeleteKeypoint = useCallback(
    (keypoint: number) => {
      setLoadingId(keypoint);
      delete_keypoint(keypoint, { onSuccess: () => setLoadingId(null) });
    },
    [delete_keypoint]
  );

  return (
    <div className={styles.listWrapper}>
      <ul className={styles.listContainer}>
        {paginatedPoints.length ? (
          paginatedPoints.map((point) => (
            <li
              key={point.keyPointId}
              onMouseEnter={() => handleMouseEnter(point.keyPointId)}
              onMouseLeave={() => handleMouseLeave(point.keyPointId)}
              className={styles.listItem}
            >
              <span className={styles.name}>{point.name}</span>
              <Button
                loading={isLoadingDeleting && point.keyPointId === loadingId}
                className={styles.deleteButton}
                onClick={() => handleDeleteKeypoint(point.keyPointId)}
              >
                <Basket />
              </Button>
            </li>
          ))
        ) : (
          <Empty description="Нет контрольных точек" />
        )}
      </ul>

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default SessionPointList;
