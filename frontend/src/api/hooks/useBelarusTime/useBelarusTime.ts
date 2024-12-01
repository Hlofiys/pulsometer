const useBelarusTime = (utcMilliseconds: number) => {
  if (!utcMilliseconds) return 0;

  // Отнимаем 3 часа (в миллисекундах) от времени UTC
  const BELARUS_OFFSET = 3 * 60 * 60 * 1000; // 3 часа в миллисекундах
  return utcMilliseconds - BELARUS_OFFSET;
};

export default useBelarusTime;
