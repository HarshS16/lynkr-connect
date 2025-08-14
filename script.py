# script_unirank_india.py
import json
import sys
from collections import OrderedDict

import requests
from bs4 import BeautifulSoup

URL = "https://www.unirank.org/in/a-z/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

def fetch_names():
    r = requests.get(URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    # Only pick actual university links (avoid nav, footers, etc.)
    uni_links = soup.select('a[href^="/in/uni/"]')

    names = []
    for a in uni_links:
        name = a.get_text(strip=True)
        if name:
            names.append(name)

    # de-dup while preserving order (shouldn’t be necessary, but safe)
    names = list(OrderedDict.fromkeys(names))
    return names

def main():
    names = fetch_names()

    # Basic sanity check
    count = len(names)
    print(f"{count} institutions found")

    # Expect ~894. If you see a tiny number like ~49, your selector is wrong
    # or a proxy/WAF blocked the page content.
    if count < 600:
        print(
            "Warning: unusually low count. "
            "Check your network or the selector logic.",
            file=sys.stderr,
        )

    # Write JSON array of strings: ["Abhilashi University", ...]
    out_path = "indian_universities_unirank.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(names, f, ensure_ascii=False, indent=2)

    # Also print the JSON to stdout if you want to pipe it somewhere
    # print(json.dumps(names, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
