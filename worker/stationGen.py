import requests
import json

rawStationsDataUrl = "https://portal.csdi.gov.hk/csdi-webpage/file-api?dataset_id=hko_rcd_1634995599372_15888&format=geojson&layer_name=HKONWS"
rawStationData = requests.get(rawStationsDataUrl, timeout=10).json()

stationData = {}
tempAliasData = {}

for rawStation in rawStationData["features"]:
    rawStationProp = rawStation["properties"]
    stationId = int(rawStationProp["OBJECTID"])
    stationName = {
        "tc": rawStationProp["Name_tc"],
        "sc": rawStationProp["Name_sc"],
        "en": rawStationProp["Name_en"]
    }
    stationAddress = {
        "tc": rawStationProp["Address_tc"],
        "sc": rawStationProp["Address_sc"],
        "en": rawStationProp["Address_en"]
    }
    stationCoords = [float(rawStationProp["Latitude"]), float(rawStationProp["Longitude"])]
    stationElevation = int(rawStationProp["Elevationofgroundabovemeansea_level_metres_en"])
    
    stationData[stationId] = {
        "name": stationName,
        "address": stationAddress,
        "coordinates": stationCoords,
        "elevation": stationElevation,
    }

    tempAliasData[rawStationProp["Name_en"]] = stationId # Need manual review!


with open("stations.json", "w", encoding="utf-8") as file:
    storeData = {
        "stations": stationData,
        "aliases": {
            "temp": tempAliasData
        }
    }
    json.dump(storeData, file, indent=4, ensure_ascii=False)

print("Remember to check temp alias after generation!")