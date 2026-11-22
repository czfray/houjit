export async function getGpsLocation() {
    const permission = await navigator.permissions.query({name: "geolocation"});
    if (permission.state === "denied") return null;
    const timeout = permission.state === "prompt" ? Infinity : 15000;

    if (!navigator.geolocation) return null;
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {resolve([Number(position.coords.latitude), Number(position.coords.longitude)]);},
            (error) => {
                console.log("Cannot read GPS location: " + error.message);
                resolve(null);
            },
            {timeout: timeout}
        );
    });
}