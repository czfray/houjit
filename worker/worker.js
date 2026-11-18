import * as TenMinReport from "./scripts/tenMinReport.js";

import stationsData from "./stations.json";
const aliasMap = stationsData.aliases.general;

export default {
    async scheduled(event, env) {
        const report = await TenMinReport.fetchTenMinReport(aliasMap);
        await putStorage(env, "tenMinReport", report);
        console.log(`[${report["time"]}] Ten Minute Report fetched!`);
    },

    async fetch(request, env) {
        const url = new URL(request.url);
        const target = url.searchParams.get("target");

        switch (target) {
            case "report":
                const report = await getStorage(env, "tenMinReport");
                return getCORSResponse(report);
            case "stations":
                return getCORSResponse(stationsData.stations);
            default:
                return Response.json(
                    { error: "Target parameter missing/invalid" },
                    { status: 400 }
                );
        }
    }
};

async function putStorage(env, name, data) {
    await env.HOUJIT_KV.put(name, JSON.stringify(data));
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