export const useBelarusDate = (
  date: string /* "2024-11-29T17:08:28.596215" */
) => {
  const utcTime = new Date(date);
  utcTime.setHours(utcTime.getHours() + 3);
  //   const belarusTime = new Date(utcTime.getTime() + 3 * 60 * 60 * 1000);
  console.log(utcTime.toISOString());
  return utcTime.toISOString();
};
