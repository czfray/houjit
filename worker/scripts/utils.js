export async function processHkoCsv(csvUrl, perLineProcess){
    const response = await fetch(`${csvUrl}?t=${Date.now()}`, {
        headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
        },

        cf: {
            cacheTtl: 0
        }
    });

    console.log("URL:", csvUrl);
    console.log("CF-Cache-Status:", response.headers.get("CF-Cache-Status"));
    console.log("Age:", response.headers.get("Age"));
    console.log("Date:", response.headers.get("Date"));
    console.log("ETag:", response.headers.get("ETag"));
    
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