export async function processHkoCsv(csvUrl, perLineProcess){
    const url = new URL(csvUrl);
    url.searchParams.set("t", Date.now());
    
    let benchmarkStart = performance.now();
    const response = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });
    console.log(`[${"Date:", response.headers.get("Date")}] Fetched URL ${csvUrl}, Cache: ${response.headers.get("CF-Cache-Status")}, Age: ${response.headers.get("Age")}, Time: ${performance.now() - benchmarkStart} ms`);
    
    if (!response.ok) {
        throw new Error(`HKO API error when fetching CSV: ${response.status}`);
    }

    benchmarkStart = performance.now();
    const rawData = await response.text();
    console.log(`CSV BODY ${csvUrl}: ${performance.now() - benchmarkStart} ms`);

    for (const rawDataInLine of rawData.trim().split("\n").slice(1)) {
        const dataInLine = rawDataInLine.split(",");
        perLineProcess(dataInLine);
    }
}

export function formatHkoTime(hkoTime){
    if (!/^\d{12}$/.test(String(hkoTime))){
        console.log(`${hkoTime} is not a valid HKO formatted time.`);
        return null;
    }

    const year = hkoTime.slice(0, 4);
    const month = hkoTime.slice(4, 6);
    const day = hkoTime.slice(6, 8);
    const hour = hkoTime.slice(8, 10);
    const minute = hkoTime.slice(10, 12);
    
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+08:00`);
}

export function getWorkerTime() {
    return new Date();
}

export function formatHkTime(date){
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date(date));
}

export function getGpsDistance(lat1, lon1, lat2, lon2){
    lat1 =  (lat1 * Math.PI) / 180;
    lat2 =  (lat2 * Math.PI) / 180;
    lon1 =  (lon1 * Math.PI) / 180;
    lon2 =  (lon2 * Math.PI) / 180;

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;
    
    const a = (Math.sin(deltaLat / 2) ** 2) + Math.cos(lat1) * Math.cos(lat2) * (Math.sin(deltaLon/ 2) ** 2);
    const R = 6371008.77141506;
    const d = 2 * R * Math.asin(Math.sqrt(a));

    return d;
}