const tempDataResponse = await fetch("https://houjit.czfray.workers.dev/?target=temp");
const tempData = await tempDataResponse.json();

const testViewer = document.getElementById("test");
testViewer.textContent = tempData.data[7] + "°";