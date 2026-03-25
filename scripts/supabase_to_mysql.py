#!/usr/bin/env python3
"""
Copy public tables from Supabase (Postgres) into local MySQL (e.g. phpMyAdmin / XAMPP).

Prereqs:
  pip install supabase pymysql python-dotenv

Env (create scripts/.env next to this file, or set in shell):
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service role for full read (bypass RLS)

  MYSQL_HOST=127.0.0.1
  MYSQL_PORT=3306
  MYSQL_USER=root
  MYSQL_PASSWORD=
  MYSQL_DATABASE=dtrak-region-ix

Usage:
  cd scripts
  python supabase_to_mysql.py

This script:
  - TRUNCATES MySQL tables (reverse FK order), then inserts rows preserving `id` where present.
  - Skips tables that do not exist in Supabase or have zero rows.

Tables synced (same names as Laravel migration):
  user_levels, region, office, action_required, action_taken, document_type,
  document_action_required_days, action_officer, users, profiles,
  document_source, document_destination

Not included: user_profiles (optional in old app) — add manually if you still need it.
"""

from __future__ import annotations

import os
import sys
from datetime import date, datetime, time, timezone

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    from supabase import create_client
except ImportError:
    print("Install: pip install supabase pymysql python-dotenv", file=sys.stderr)
    sys.exit(1)

try:
    import pymysql
except ImportError:
    print("Install: pip install pymysql", file=sys.stderr)
    sys.exit(1)


ROOT = os.path.dirname(os.path.abspath(__file__))
if load_dotenv:
    # Backend holds Supabase URL + service role; scripts/.env holds MySQL (local).
    load_dotenv(os.path.join(os.path.dirname(ROOT), "backend", ".env"))
    load_dotenv(os.path.join(ROOT, ".env"))


def env(name: str, default: str | None = None) -> str:
    v = os.environ.get(name, default)
    if v is None or v == "":
        raise SystemExit(f"Missing env: {name}")
    return v


# Parents first; document_destination last (FK -> document_source)
TABLES_ORDER = [
    "user_levels",
    "region",
    "office",
    "action_required",
    "action_taken",
    "document_type",
    "document_action_required_days",
    "action_officer",
    "users",
    "profiles",
    "document_source",
    "document_destination",
]

# Truncate in reverse (children first)
TRUNCATE_ORDER = list(reversed(TABLES_ORDER))


def to_mysql_value(col: str, val):
    if val is None:
        return None
    if isinstance(val, bool):
        return 1 if val else 0
    if isinstance(val, (dict, list)):
        import json

        return json.dumps(val)
    if isinstance(val, str) and col == "id" and len(val) == 36 and val.count("-") == 4:
        return val  # uuid string
    if isinstance(val, datetime):
        if val.tzinfo is not None:
            return val.astimezone(timezone.utc).replace(tzinfo=None)
        return val
    if isinstance(val, date) and not isinstance(val, datetime):
        return val
    if isinstance(val, time):
        return val
    # ISO strings from PostgREST JSON
    if isinstance(val, str) and len(val) >= 10 and val[4] == "-" and val[7] == "-":
        if "T" in val or val.endswith("Z"):
            try:
                s = val.replace("Z", "+00:00") if val.endswith("Z") else val
                dt = datetime.fromisoformat(s)
                if dt.tzinfo is not None:
                    dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
                return dt
            except ValueError:
                pass
    return val


def fetch_all(supabase, table: str) -> list[dict]:
    res = supabase.table(table).select("*").execute()
    data = res.data
    if not data:
        return []
    return data if isinstance(data, list) else [data]


def main() -> None:
    url = env("SUPABASE_URL")
    key = env("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)

    conn = pymysql.connect(
        host=os.environ.get("MYSQL_HOST", "127.0.0.1"),
        port=int(os.environ.get("MYSQL_PORT", "3306")),
        user=os.environ.get("MYSQL_USER", "root"),
        password=os.environ.get("MYSQL_PASSWORD", ""),
        database=env("MYSQL_DATABASE"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )

    with conn.cursor() as cur:
        cur.execute("SET FOREIGN_KEY_CHECKS=0")
        for t in TRUNCATE_ORDER:
            try:
                cur.execute(f"TRUNCATE TABLE `{t}`")
                print(f"TRUNCATE {t}")
            except Exception as e:
                print(f"SKIP truncate {t}: {e}")
        conn.commit()

    total = 0
    for table in TABLES_ORDER:
        try:
            rows = fetch_all(supabase, table)
        except Exception as e:
            print(f"SKIP read {table}: {e}")
            continue
        if not rows:
            print(f"{table}: 0 rows")
            continue

        cols = list(rows[0].keys())
        placeholders = ", ".join(["%s"] * len(cols))
        colsql = ", ".join(f"`{c}`" for c in cols)
        insert_sql = f"INSERT INTO `{table}` ({colsql}) VALUES ({placeholders})"

        n = 0
        with conn.cursor() as cur:
            for row in rows:
                vals = []
                for c in cols:
                    vals.append(to_mysql_value(c, row.get(c)))
                try:
                    cur.execute(insert_sql, tuple(vals))
                    n += 1
                except Exception as e:
                    print(f"ERROR {table} id={row.get('id')}: {e}")
                    raise
        conn.commit()
        total += n
        print(f"{table}: inserted {n} rows")

    with conn.cursor() as cur:
        cur.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    conn.close()
    print(f"Done. Total rows inserted: {total}")


if __name__ == "__main__":
    main()
