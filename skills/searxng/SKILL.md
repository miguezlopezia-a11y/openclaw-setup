---
name: searxng
description: Search the web using the local SearXNG metasearch engine. Use when asked to search for information, news, research topics, find code examples, look up documentation, or answer questions requiring up-to-date web information.
---

# SearXNG — Local Web Search

A privacy-preserving metasearch engine running locally on the server. Aggregates results from Google, Bing, DuckDuckGo, Wikipedia, GitHub, StackOverflow, arXiv, and Google News.

## Endpoint

```
http://searxng:8080/search?q=QUERY&format=json&categories=CATEGORY&lang=es-ES
```

## Categories

| Category | Content |
|----------|---------|
| `general` | Web general (default) |
| `news` | Current news |
| `it` | Programming, tech, Stack Overflow, GitHub |
| `science` | Academic papers, arXiv |

## How to search

```bash
# General search
curl -sf "http://searxng:8080/search?q=YOUR+QUERY&format=json" | python3 -c "
import json, sys, urllib.parse
data = json.load(sys.stdin)
results = data.get('results', [])
print(f'Found {len(results)} results')
for r in results[:5]:
    print(f"\nTitle: {r.get('title', '')}")
    print(f"URL:   {r.get('url', '')}")
    print(f"Desc:  {r.get('content', '')[:250]}")
"

# News search
curl -sf "http://searxng:8080/search?q=YOUR+TOPIC&format=json&categories=news" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for r in data.get('results', [])[:5]:
    print(f"{r.get('publishedDate','?')} | {r.get('title','')} | {r.get('url','')}")
"

# Code/tech search
curl -sf "http://searxng:8080/search?q=YOUR+TECH+QUESTION&format=json&categories=it" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for r in data.get('results', [])[:5]:
    print(f"[{r.get('engine','')}] {r.get('title','')}\n  {r.get('url','')}\n")
"
```

## Tips

- URL-encode spaces as `+` in the query parameter
- Limit results by piping through `[:N]`
- The `engine` field shows which source found each result
- `publishedDate` is available on news results
- Scores/weights are in `score` field

## Notes

- SearXNG runs at `http://searxng:8080` inside the Docker network
- Port 8080 is NOT exposed publicly — internal only
- No search history stored, no tracking
