const formatLT10 = (value: string): string => `${value.length < 2 ? '0' : ''}${value}`;

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
    var month = formatLT10(`${(date.getMonth() + 1)}`),
    day = formatLT10(`${date.getDate()}`),
    year = formatLT10(`${date.getFullYear()}`),
    hour = formatLT10(`${date.getHours()}`),
    minutes = formatLT10(`${date.getMinutes()}`),
    seconds = formatLT10(`${date.getSeconds()}`),
    miliseconds = formatLT10(`${date.getMilliseconds()}`);

    return `${year}-${month}-${day}_${hour}-${minutes}-${seconds}.${miliseconds}`;
};

const formatAmPm = (hour: number, minutes:string): string => 
        `${hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:${minutes} p.m.` : `${hour === 0 ? 12 : hour}:${minutes} a.m.`}`;

/**Returns a date in spanish*/
export const formatDateToSpanish = (date:Date): string => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    var month = date.getMonth(),
    day = formatLT10(`${date.getDate()}`),
    year = date.getFullYear(),
    hour = date.getHours(),
    minutes = formatLT10(`${date.getMinutes()}`)

    return `${day} de ${months[month]} del ${year} a las ${formatAmPm(hour, minutes)}`;
};

export const formatDateToMini = (date:Date): string => {
    var month = formatLT10(`${(date.getMonth() + 1)}`),
    day = formatLT10(`${date.getDate()}`),
    year = `${date.getFullYear()}`,
    hour = date.getHours(),
    minutes = formatLT10(`${date.getMinutes()}`);

    return `${day}/${month}/${year} ${formatAmPm(hour, minutes)}`;
};

export const concatDates = (dates: Date[]): string => {
    var concat = ''
    dates.forEach((date, idx) => concat += `${formatDateToMini(date)}${idx === (dates.length - 1) ? '': ','}`);
    return concat;
}