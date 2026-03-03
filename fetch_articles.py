"""
Fetches the latest ski alpin articles from Bing News RSS, filters out
video/audio clips, extracts og:image from each article page, and writes
the result to articles.json.

Run manually:  python fetch_articles.py
Run via CI:    GitHub Actions (.github/workflows/update-articles.yml)
"""

import json
import re
import time
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

RSS_URL = (
    "https://www.bing.com/news/search"
    "?q=ski+alpin+rts&format=RSS&mkt=fr-CH&cc=CH&setlang=fr"
)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-CH,fr;q=0.9",
}
MAX_ARTICLES = 6
OUTPUT_FILE = "articles.json"

# URL path segments that indicate non-article content
NON_ARTICLE_PATHS = ["/audio/", "/audio-podcast/", "/play/", "/video/", "/podcast/"]

# Title patterns that indicate video clips
VIDEO_TITLE_PATTERNS = [
    r"\ble passage de\b",
    r"\(Vidéo\)",
    r"\(vidéo\)",
    r"^Direct\s*:",
    r"\bEn direct\b",
    r"- Play RTS",
]


def fetch(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            charset = "utf-8"
            content_type = r.headers.get("Content-Type", "")
            m = re.search(r"charset=([^\s;,]+)", content_type)
            if m:
                charset = m.group(1).strip('"\'')
            return r.read().decode(charset, errors="replace")
    except Exception as e:
        print(f"  fetch error {url[:80]}: {e}")
        return None


def extract_real_url(bing_link):
    """
    Bing News RSS links look like:
    http://www.bing.com/news/apiclick.aspx?...&url=https%3a%2f%2fwww.rts.ch%2f...&...
    Extract the real article URL from the url= parameter.
    """
    try:
        parsed = urllib.parse.urlparse(bing_link)
        params = urllib.parse.parse_qs(parsed.query)
        real = params.get("url", [None])[0]
        return real if real else bing_link
    except Exception:
        return bing_link


def is_non_article(url, title):
    """Return True for audio podcasts, videos, or race clip titles."""
    url_lower = url.lower()
    for seg in NON_ARTICLE_PATHS:
        if seg in url_lower:
            return True
    for pat in VIDEO_TITLE_PATTERNS:
        if re.search(pat, title, re.I):
            return True
    return False


def get_og_image(html):
    if not html:
        return ""
    m = re.search(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        html, re.I
    )
    if not m:
        m = re.search(
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            html, re.I
        )
    return m.group(1) if m else ""


def unescape(text):
    """Basic HTML entity unescape."""
    return (text
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
            .replace("&#39;", "'"))


def fetch_articles():
    print("Fetching Bing News RSS …")
    xml_text = fetch(RSS_URL)
    if not xml_text:
        print("RSS fetch failed.")
        return []

    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        print(f"XML parse error: {e}")
        return []

    items = root.findall(".//item")
    print(f"Found {len(items)} RSS items.")

    articles = []
    for item in items:
        raw_title = (item.findtext("title") or "").strip()
        bing_link  = (item.findtext("link")  or "").strip()

        if not raw_title or not bing_link:
            continue

        title    = unescape(raw_title)
        real_url = extract_real_url(bing_link)

        if is_non_article(real_url, title):
            print(f"  [skip] {title[:70]}")
            continue

        print(f"  [fetch] {title[:70]}")
        html  = fetch(real_url, timeout=12)
        image = unescape(get_og_image(html))

        articles.append({"title": title, "link": real_url, "image": image})

        if len(articles) >= MAX_ARTICLES:
            break

        time.sleep(0.5)

    return articles


if __name__ == "__main__":
    articles = fetch_articles()

    if articles:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(articles, f, ensure_ascii=False, indent=4)
        print(f"\nSaved {len(articles)} articles to {OUTPUT_FILE}.")
    else:
        print("\nNo articles found — keeping existing articles.json unchanged.")
