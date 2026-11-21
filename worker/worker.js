//npx wrangler dev --test-scheduled -c worker/wrangler.jsonc
//curl -s http://localhost:8787/__scheduled OR Invoke-WebRequest -Uri "http://localhost:8787/__scheduled" 

import * as TenMinReport from "./scripts/tenMinReport.js";
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
        const target = url.searchParams.get("target");

        switch (target) {
            case "report":
                const report = await getStorage(env, "tenMinReport");
                return getCORSResponse(report);
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