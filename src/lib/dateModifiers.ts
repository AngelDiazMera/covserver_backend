/**Add some specified `minutes` to a `date`.*/
export const addMinutes = (date: Date, minutes: number): Date => {
    return new Date (date.getTime() + minutes*60000)
};

/**Add some specified `days` to a `date`.*/
export const addDays = (date: Date, days: number): Date => {
    date.setDate(date.getDate() + days);
    return date;
};
/**A date in format YYYY-MM-DD_HH-mm-SS.MS*/
export const formatDateToTopic = (date:Date): string => {
    const formatLT10 = (value: string): string => `${value.length < 2 ? '0' : ''}${value}`;
    
    var month = formatLT10(`${(date.getMonth() + 1)}`),
    day = formatLT10(`${date.getDate()}`),
    year = formatLT10(`${date.getFullYear()}`),
    hour = formatLT10(`${date.getHours()}`),
    minutes = formatLT10(`${date.getMinutes()}`),
    seconds = formatLT10(`${date.getSeconds()}`),
    miliseconds = formatLT10(`${date.getMilliseconds()}`);

    return `${year}-${month}-${day}_${hour}-${minutes}-${seconds}.${miliseconds}`;
};