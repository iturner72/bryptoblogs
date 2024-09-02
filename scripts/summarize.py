import json
import random
import time

import openai
import tiktoken


def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0613"):
    """Return the number of tokens used by a list of messages."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        print("Warning: model not found. Using cl100k_base encoding.")
        encoding = tiktoken.get_encoding("cl100k_base")
    if model in {
        "gpt-3.5-turbo-0613",
        "gpt-3.5-turbo-16k-0613",
        "gpt-4-0314",
        "gpt-4-32k-0314",
        "gpt-4-0613",
        "gpt-4-32k-0613",
    }:
        tokens_per_message = 3
        tokens_per_name = 1
    elif model == "gpt-3.5-turbo-0301":
        tokens_per_message = (
            4  # every message follows <|start|>{role/name}\n{content}<|end|>\n
        )
        tokens_per_name = -1  # if there's a name, the role is omitted
    elif "gpt-3.5-turbo" in model:
        # print("Warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613.")
        return num_tokens_from_messages(messages, model="gpt-3.5-turbo-0613")
    elif "gpt-4" in model:
        # print("Warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.")
        return num_tokens_from_messages(messages, model="gpt-4-0613")
    else:
        raise NotImplementedError(
            f"""num_tokens_from_messages() is not implemented for model {model}. See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens."""
        )
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3  # every reply is primed with <|start|>assistant<|message|>
    return num_tokens


def get_summary(title, description, model="gpt-3.5-turbo"):
    # Set maximum number of tokens
    max_tokens = 4096

    # The initial prompt
    prompt = f"Create a one line description for a technical blogpost based on the title and description I provide you. You should simply describe what the post is about. Respond only in JSON, using 'summary' as the key. Do not say what you're describing, i.e. don't start with 'this blogpost is about'.\n\nTitle: '{title}'\n\nDescription: '{description}'"
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt},
    ]

    # Get the number of tokens in the messages
    num_tokens = num_tokens_from_messages(messages, model=model)

    # Shorten the description until the total number of tokens is less than max_tokens
    while num_tokens > max_tokens:
        # Reduce the description by 10%
        description = description[: int(len(description) * 0.9)]
        # Update the prompt with the shortened description
        prompt = f"Create a one line description for a technical blogpost based on the title and description I provide you. You should simply describe what the post is about. Respond only in JSON, using 'summary' as the key. Do not say what you're describing, i.e. don't start with 'this blogpost is about'.\n\nTitle: '{title}'\n\nDescription: '{description}'"
        # Update the messages with the new prompt
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ]
        # Update the number of t
