export async function processHkoCsv(csvUrl, perLineProcess){
    const response = await fetch(csvUrl);
    if (!response.ok) {
        throw new Error(`HKO API error when fetching CSV: ${response.status}`);
    }

    const rawData = await response.text();
    for (const rawDataInLine of rawData.trim().split("\n").slice(1)) {
        const dataInLine = rawDataInLine.split(",");
        perLineProcess(dataInLine);
    }
}

export function formatHkoTime(hkoTime){
    const year = hkoTime.slice(0, 4);
    const month = hkoTime.slice(4, 6);
    const day = hkoTime.slice(6, 8);
    const hour = hkoTime.slice(8, 10);
    const minute = hkoTime.slice(10, 12);
    return `${day}/${month}/${year}, ${hour}:${minute}`;
}