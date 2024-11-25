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
  formatTime: string;
  totalTime: string; // Новое поле для общего времени
}

export const convertMilliseconds = (ms: number): ITime => {
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

  const formatTime = [
    formattedHours,
    formattedMinutes,
    formattedSeconds,
    formattedMilliseconds,
  ]
    .filter(Boolean)
    .join(" ");

  // Общее время в формате часы:минуты:секунды:миллисекунды
  const totalTime = [
    hours > 0 ? hours.toString().padStart(2, "0") : null, // Часы, если больше 0
    minutes > 0 || hours > 0 ? minutes.toString().padStart(2, "0") : null, // Минуты, если больше 0 или есть часы
    seconds.toString().padStart(2, "0"), // Секунды всегда отображаются
    milliseconds !== "000" ? milliseconds : null, // Миллисекунды, если они не равны "000"
  ]
    .filter(Boolean) // Убираем пустые значения
    .join(":"); // Объединяем через ":"

  return {
    minutes,
    seconds,
    milliseconds,
    formatTime,
    totalTime,
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

export const parseDateAndTime = (dateAndTime: string) => {
  //2024-05-22T11:50:00
  const [date, time] = dateAndTime.split("T");
  const [hours, minutes] = time.split(":");

  return {
    default: dateAndTime,
    format: `${parseDate(date)}, ${hours}:${minutes}`,
  };
};
