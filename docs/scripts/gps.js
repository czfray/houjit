export function getGpsLocation() {
    if (!navigator.geolocation) return null;
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {resolve([Number(position.coords.latitude), Number(position.coords.longitude)]);},
            (error) => {
                console.log("Cannot read GPS location: " + error.message);
                resolve(null);
            },
            {timeout: 15000}
        );
    });
}