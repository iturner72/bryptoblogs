import datetime
import os
from openai import OpenAI

import feedparser
from dotenv import load_dotenv
from supabase import create_client
from tqdm import tqdm

from scrape import scrape_poast
from summarize import get_poast_insights

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
client = OpenAI()
client.api_key = os.getenv("OPENAI_API_KEY")


def parse_date(date_string):
    formats = [
        "%Y-%m-%dT%H:%M:%SZ",  # Format like '2023-07-06T19:00:51Z'
        "%a, %d %b %Y %H:%M:%S %Z",  # Format like 'Tue, 20 Jun 2023 00:00:00 GMT'
        "%a, %d %b %Y %H:%M:%S %z",  # Format like 'Wed, 08 Mar 2023 00:00:00 +0000'
        "%Y-%m-%dT%H:%M:%S.%f%z",  # Format like '2023-07-06T12:50:00.000-07:00'
        "%Y-%m-%d %H:%M:%S",  # Format like '2023-06-29 16:30:00'
        "%Y-%m-%dT%H:%M:%S%z",  # Format like '2023-09-13T00:00:00+00:00'
    ]
    for fmt in formats:
        try:
            return datetime.datetime.strptime(date_string, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    raise ValueError(f"couldn't parse date {date_string} with any of the known formats")


def parse_feed(url, company):
    feed = feedparser.parse(url)
    for entry in feed.entries:

        # Skip on bad entries
        if not hasattr(entry, "title") or not hasattr(entry, "link") or not hasattr(entry, "published"):
            print(f"Skipped bad entry: {entry}")
            continue

        # Fetch title and description
        title = entry.title
        description = getattr(entry, "description", "")
        # Convert the timestamp into yyyy-mm-dd format
        published_at = parse_date(entry.published)
        link = entry.link

        # Check if the entry exists in the 'posts' table
        if supabase.table("poasts").select("*").eq("link", link).execute().data:
            print(f"Skipped existing poast: {title} from {company}")
            continue

        try:
            full_text = scrape_poast(link)

            insights = get_poast_insights(client, title, full_text)
            summary = insights["summary"]
            buzzwords = insights["buzzwords"]

            entry_data = {
                "published_at": published_at,
                "company": company,
                "title": title,
                "link": link,
                "description": description,
                "summary": summary,
                "full_text": full_text,
                "buzzwords": buzzwords,
            }
            supabase.table("poasts").insert(entry_data).execute()
            print(f"Inserted poast {title} from {company}")

        except Exception as e:
            print(f"Error: {e}")
            continue

# Fetch companies and links from the 'links' table
response = supabase.table("links").select("company, link").execute()
print("Supabase Response:", response)
rss_links = response.data
print("response data:", response)

print("Start parsing feeds...")
for link_info in tqdm(rss_links, desc="Parsing RSS feeds", unit="feed"):
    company = link_info["company"]
    url = link_info["link"]
    parse_feed(url, company)
print("Finished parsing feeds.")
