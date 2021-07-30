/**Find the index of all occurrences of a `value` in `array`.*/
export const getAllIndexes = (array: any[], value: any): number[] => {
    var indexes: number[] = [], i = -1;
    while ((i = array.indexOf(value, i + 1)) != -1)
        indexes.push(i);
    
    return indexes;
}