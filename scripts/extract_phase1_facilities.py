import json
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "facilities_ca.sqlite"
OUTPUT_PATH = ROOT / "phase1_facilities.json"

MARKET_CITY_MAP = {
    "temecula-valley": {"TEMECULA", "MURRIETA", "WINCHESTER", "FRENCH VALLEY"},
    "inland-valley": {"WILDOMAR", "LAKE ELSINORE", "MURRIETA", "MENIFEE"},
    "rancho-springs": {"MURRIETA", "TEMECULA", "MENIFEE", "WILDOMAR"},
    "murrieta-loma-linda": {"MURRIETA", "TEMECULA", "MENIFEE", "WILDOMAR"},
    "menifee-global": {"MENIFEE", "SUN CITY", "PERRIS", "MURRIETA"},
}


def infer_market(city: str) -> list[str]:
    normalized = (city or "").strip().upper()
    return [slug for slug, cities in MARKET_CITY_MAP.items() if normalized in cities]


def extract_records() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(
        """
        select
          source_facility_id,
          FACILITY_NAME,
          FACILITY_ADDRESS,
          FACILITY_CITY,
          FACILITY_STATE,
          FACILITY_ZIP,
          COUNTY_NAME,
          FACILITY_TELEPHONE_NUMBER,
          FACILITY_STATUS,
          FACILITY_TYPE,
          FACILITY_CAPACITY
        from ca_ccld_registry
        where upper(trim(FACILITY_STATUS)) = 'LICENSED'
          and upper(trim(FACILITY_TYPE)) in (
            'RESIDENTIAL CARE ELDERLY',
            'RCFE-CONTINUING CARE RETIREMENT COMMUNITY'
          )
        order by FACILITY_NAME
        """
    )
    rows = cur.fetchall()
    conn.close()

    records = []
    for row in rows:
      markets = infer_market(row["FACILITY_CITY"])
      if not markets:
          continue
      record = {
          "source_facility_id": row["source_facility_id"],
          "name": row["FACILITY_NAME"],
          "address": row["FACILITY_ADDRESS"],
          "city": row["FACILITY_CITY"],
          "state": row["FACILITY_STATE"],
          "zip": row["FACILITY_ZIP"],
          "county": row["COUNTY_NAME"],
          "phone": row["FACILITY_TELEPHONE_NUMBER"],
          "license_status": row["FACILITY_STATUS"],
          "care_category": row["FACILITY_TYPE"],
          "capacity": int(row["FACILITY_CAPACITY"]) if row["FACILITY_CAPACITY"] else None,
          "launch_markets": markets,
      }
      records.append(record)
    return records


def main() -> None:
    records = extract_records()
    OUTPUT_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} vetted Phase 1 facilities to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
