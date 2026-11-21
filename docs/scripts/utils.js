export function getApparentTemp(airTemp, humidity, windSpdKmh){
    const e = (humidity / 100) * 6.105 * Math.exp(((17.27 * airTemp)/(237.7 + airTemp)));
    const v = windSpdKmh / 3.6;
    return airTemp + 0.33 * e - 0.7 * v - 4.0;
}