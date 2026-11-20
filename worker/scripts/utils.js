export async function processHkoCsv(csvUrl, perLineProcess){
    const url = new URL(csvUrl);
    url.searchParams.set("t", Date.now());
    
    const response = await fetch(url);
    console.log(`[${"Date:", response.headers.get("Date")}] Fetched URL ${csvUrl}, Cache: ${response.headers.get("CF-Cache-Status")}, Age: ${response.headers.get("Age")}`);
    
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
