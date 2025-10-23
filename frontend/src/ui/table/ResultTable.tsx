import { FC } from "react";
import styles from "./ResultTable.module.scss";

export interface HeartRateData {
  fullName: string;
  initial: number;
  afterWarmUp: number;
  mainPart: number;
  afterMain: number;
  afterFiveMin: number;
}

interface HeartRateTableProps {
  data: Partial<HeartRateData>;
}

const ResultTable: FC<HeartRateTableProps> = ({ data }) => {
  const formatDelta = (num?: number) => {
    if (num === undefined) return <span>Нет данных</span>;
    if (num === 0) return <span onClick={() => console.log(num)}>0</span>;
    if (num > 0)
      return <span style={{ color: "#23e70a" }}>+{num.toFixed(2)}%</span>;
    return <span style={{ color: "red" }}>{num.toFixed(2)}%</span>;
  };

  const formatName = (fullName?: string) => {
    if (!fullName || typeof fullName !== "string") return 'Нет данных'; // если пусто или не строка

    // Убираем лишние пробелы и делим на слова
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 0) return ""; // если строка была только из пробелов
    if (parts.length === 1) return parts[0]; // если только одно слово (например только фамилия)

    // Берем первые два слова: фамилия и имя
    return `${parts[0]} ${parts[1]}`;
  };
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Фамилия и Имя</th>
            <th>
              Исходная ЧСС
              <br /> (%)
            </th>
            <th>
              ЧСС после подготовительной части
              <br /> (%)
            </th>
            <th>
              ЧСС на высоте основной части
              <br /> (%)
            </th>
            <th>
              ЧСС заключительной части
              <br />
              (%)
            </th>
            <th>
              ЧСС 5 минут после урока
              <br /> (%)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Фамилия и имя">{formatName(data.fullName)}</td>
            <td data-label="Исходная ЧСС (%)">{formatDelta(data.initial)}</td>
            <td data-label="ЧСС после подготовительной части (%)">
              {formatDelta(data.afterWarmUp)}
            </td>
            <td data-label="ЧСС на высоте основной части (%)">
              {formatDelta(data.mainPart)}
            </td>
            <td data-label="ЧСС заключительной части (%)">
              {formatDelta(data.afterMain)}
            </td>
            <td data-label="ЧСС 5 минут после урока (%)">
              {formatDelta(data.afterFiveMin)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
