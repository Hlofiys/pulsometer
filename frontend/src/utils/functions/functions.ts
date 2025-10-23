export const hasAllValuesForKeys = (
  obj: { [key: string]: any },
  keys: string[]
): boolean => {
  for (let key of keys) {
    if (obj.hasOwnProperty(key)) {
      if (
        obj[key] === "" ||
        obj[key] === null ||
        obj[key] === undefined ||
        obj[key] === 0
      ) {
        return false;
      }
    }
  }
  return true;
};

export interface ITime {
  minutes: number;
  seconds: number;
  milliseconds: string;
  formatWordTime: string;
  formatNumberTime: string; // Новое поле для общего времени
  totalSeconds: number;
}

interface IConvertMillisecondsProps {
  ms: number;
  withoutMs?: boolean;
  isLive?: boolean;
}
export const convertMilliseconds = (
  props: IConvertMillisecondsProps
): ITime => {
  const { ms, withoutMs, isLive } = props;

  if (ms === 0)
    return {
      minutes: 0,
      seconds: 0,
      milliseconds: "0",
      formatWordTime: "",
      formatNumberTime: "00:00",
      totalSeconds: 0,
    };

  const hours = Math.floor(ms / 3600000); // Вычисляем часы
  const minutes = Math.floor((ms % 3600000) / 60000); // Оставшиеся минуты
  const seconds = Math.floor((ms % 60000) / 1000); // Оставшиеся секунды
  const milliseconds = (ms % 1000).toString().padStart(3, "0"); // Миллисекунды с ведущими нулями

  // Форматируем части времени для отображения
  const formattedMinutes = minutes > 0 ? `${minutes} мин.` : "";
  const formattedSeconds = seconds > 0 ? `${seconds} с.` : "";
  const formattedMilliseconds =
    milliseconds !== "000" ? `${milliseconds} мс.` : "";
  const formattedHours = hours > 0 ? `${hours} ч.` : "";

  const formatWordTime = [
    formattedHours,
    formattedMinutes,
    formattedSeconds,
    formattedMilliseconds,
  ]
    .filter(Boolean)
    .join(" ");

  // Общее время в формате часы:минуты:секунды:миллисекунды
  const formatNumberTime = isLive
    ? `${hours.toString().padStart(2, "0")}:${(minutes + 1)
        .toString()
        .padStart(2, "0")}''` // Формат для режима реального времени "чч:мм''"
    : [
        hours > 0 ? hours.toString().padStart(2, "0") : null, // Часы, если больше 0
        minutes.toString().padStart(2, "0"), // Всегда отображаем минуты
        seconds.toString().padStart(2, "0"), // Секунды всегда отображаются
        milliseconds !== "000" && !withoutMs ? milliseconds : null, // Миллисекунды, если они не равны "000"
      ]
        .filter(Boolean) // Убираем пустые значения
        .join(":"); // Объединяем через ":"

  return {
    minutes,
    seconds,
    milliseconds,
    formatWordTime,
    formatNumberTime,
    totalSeconds: ms / 1000,
  };
};

export const capitalizeFirstLetter = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const parseDate = (time: string /*2024-05-22*/): string => {
  if (time.split("-").length === 1) return time;

  const [year, month, day] = time.split("-");
  const monthes = [
    "янв",
    "фвр",
    "март",
    "апр",
    "мая",
    "июня",
    "июля",
    "авг",
    "сент",
    "окт",
    "ноября",
    "декабря",
  ];
  return `${day} ${monthes[+month - 1]} ${year}г.`;
};

export const parseUTCDateAndTime = (dateAndTime: string) => {
  // Создаём объект даты из строки
  const utcDate = new Date(dateAndTime);

  // Преобразуем в UTC+3 (Беларусь)
  const belarusTime = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

  // Извлекаем компоненты даты
  const year = belarusTime.getFullYear();
  const month = String(belarusTime.getMonth() + 1).padStart(2, "0");
  const day = String(belarusTime.getDate()).padStart(2, "0");
  const hours = String(belarusTime.getHours()).padStart(2, "0");
  const minutes = String(belarusTime.getMinutes()).padStart(2, "0");
  const seconds = String(belarusTime.getSeconds()).padStart(2, "0");

  const formatDate = parseDate(`${year}-${month}-${day}`); //2024-05-22

  // Форматируем в строку
  return {
    belarusian: `${formatDate}, ${hours}:${minutes}:${seconds}`,
    default: dateAndTime,
  };
};

export function formatDateUser(isoString: string): {
  short: string;
  long: string;
} {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return { short: "", long: "" };
  }

  // Длинный формат: "14 октября 2025 г., 14:09"
  const longOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const long = date.toLocaleString("ru-RU", longOptions);

  // Короткий формат: "14.10.2025, 14:09"
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const short = `${day}.${month}.${year}, ${hours}:${minutes}`;

  return { short, long };
}

export interface IDashboardParam {
  label: number; // bpm
  value: number; // время в миллисекундах
}

export interface IHeartRateZones {
  introductory: number;
  preparatory: number;
  main: number;
  final: number;
}

// Доли длительности урока (всего = 1)
export interface IHeartRateZones {
  introductory: number;
  preparatory: number;
  main: number;
  final: number;
}
export const calculateHeartRateDeltaZones = (
  data: { label: number; value: number }[]
) => {
  if (!data.length) return {};

  const boundaries = [0, 3.6, 12.15, 40.5, 45];

  const getZonePoints = (from: number, to: number) => {
    const points = data.filter((p) => {
      const timeMin = p.label / 1000 / 60;
      return timeMin > from / 1000 / 60 && timeMin <= to / 1000 / 60;
    });
    return points;
  };

  const getAverageBPM = (from: number, to: number) => {
    const values = getZonePoints(from, to).map((p) => p.value);
    if (!values.length) return undefined; // <--- возвращаем undefined, если нет данных
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const delta = (base?: number, current?: number) => {
    if (base === undefined || current === undefined) return undefined; // <--- обработка undefined
    if (base === 0) return 0;
    return Number((((current - base) / base) * 100).toFixed(2));
  };

  const zones = {
    introductory: {
      avg: getAverageBPM(boundaries[0], boundaries[1]),
      points: getZonePoints(boundaries[0], boundaries[1]),
    },
    preparatory: {
      avg: getAverageBPM(boundaries[1], boundaries[2]),
      points: getZonePoints(boundaries[1], boundaries[2]),
    },
    main: {
      avg: getAverageBPM(boundaries[2], boundaries[3]),
      points: getZonePoints(boundaries[2], boundaries[3]),
    },
    final: {
      avg: getAverageBPM(boundaries[3], boundaries[4]),
      points: getZonePoints(boundaries[3], boundaries[4]),
    },
  };

  const base = zones.introductory.avg; // исходный пульс

  return {
    introductory: {
      ...zones.introductory,
      delta: 0,
    },
    preparatory: {
      ...zones.preparatory,
      delta: delta(base, zones.preparatory.avg),
    },
    main: {
      ...zones.main,
      delta: delta(base, zones.main.avg),
    },
    final: {
      ...zones.final,
      delta: delta(base, zones.final.avg),
    },
  };
};
