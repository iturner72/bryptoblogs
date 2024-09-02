import json

def get_poast_insights(client, title, fullText, model="gpt-3.5-turbo-0125", max_tokens=100):
    prompt = (
        f"Create a one-line description for a technical blog post based on the title and full text I provide you. "
        f"Also, give me a list of the top 5 most important buzzwords from the same. "
        f"Respond only in JSON, using 'summary' and 'buzzwords' as the keys."
        f"\n\nTitle: '{title}'\n\nFull Text: '{fullText}'"
    )

    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt},
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content

    try:
        result = json.loads(content)
    except json.decoder.JSONDecodeError:
        return {"summary": "No summary generated.", "buzzwords": []}

    summary = result.get("summary", "No summary generated.")
    buzzwords = result.get("buzzwords", [])
    return {"summary": summary, "buzzwords": buzzwords}
