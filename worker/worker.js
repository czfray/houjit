//npx wrangler dev --test-scheduled -c worker/wrangler.jsonc
//curl -s http://localhost:8787/__scheduled OR Invoke-WebRequest -Uri "http://localhost:8787/__scheduled" 

import * as TenMinReport from "./scripts/tenMinReport.js";
import * as UserReport from "./scripts/userReport.js";
import * as Utils from "./scripts/utils.js";

import stationsData from "./data/stations.json";
const aliasMap = stationsData.aliases.general;

export default {
    async scheduled(event, env) {
        let report = await TenMinReport.fetchTenMinReport(aliasMap);
        report["workerTime"] = Utils.getWorkerTime();
        await putStorage(env, "tenMinReport", report);
        console.log(`[${Utils.formatHkTime(report["workerTime"])} | ${Utils.formatHkTime(report["hkoTime"])}] Ten Minute Report fetched!`);
    },

    async fetch(request, env) {
        const url = new URL(request.url);
        const lon = Number(url.searchParams.get("lon"));
        const lat = Number(url.searchParams.get("lat"));

        const tenMinReport = await getStorage(env, "tenMinReport");
        const userReport = await UserReport.fetchUserReport(lat, lon, tenMinReport, stationsData);
        return getCORSResponse(userReport);
    }
};

async function putStorage(env, name, data) {
    console.time("KV PUT");
    await env.HOUJIT_KV.put(name, JSON.stringify(data));
    console.timeEnd("KV PUT");
}

async function getStorage(env, name){
    return await env.HOUJIT_KV.get(name, "json");
}

function getCORSResponse(data) {
    return Response.json(data, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store"
        }
    });
}