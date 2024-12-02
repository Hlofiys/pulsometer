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

export const convertMilliseconds = (ms: number, withoutMs?: boolean): ITime => {
  if (ms === 0)
    return {
      minutes: 0,
      seconds: 0,
      milliseconds: "0",
      formatWordTime: "",
      formatNumberTime: "",
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
  const formatNumberTime = [
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

  const formatDate = parseDate(`${year}-${month}-${day}`) //2024-05-22

  // Форматируем в строку
  return {
    belarusian: `${formatDate}, ${hours}:${minutes}:${seconds}`,
    default: dateAndTime,
  };
};
