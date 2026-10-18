"""Interactive local configuration; never persists or echoes the API key."""
import getpass
import json
import urllib.error
from .core import APIClient

DEFAULT_BASE = 'https://api2imgtocn.shubiaobiao.com/v1'


def local_client(args, environ, discover_only=False):
    base = args.api_base or environ.get('TARGET_API_BASE') or DEFAULT_BASE
    key = environ.get('TARGET_API_KEY') or getpass.getpass('API key (hidden; not saved): ').strip()
    if not key:
        raise ValueError('An API key is required')
    model = getattr(args, 'model', None) or environ.get('TARGET_MODEL')
    client = APIClient(dict(TARGET_API_BASE=base, TARGET_API_KEY=key,
                           TARGET_MODEL=model or 'model-discovery-only'))
    if model and not discover_only:
        return client
    try:
        models = client.list_models()
    except (urllib.error.HTTPError, ValueError) as error:
        if discover_only or (isinstance(error, urllib.error.HTTPError) and error.code not in (404, 405)):
            raise
        print('Model discovery unavailable. Enter an exact model ID from your provider.')
        model = input('Model ID: ').strip()
        if not model:
            raise ValueError('A model ID is required')
        client.model = model
        return client
    if discover_only:
        print(json.dumps(models, ensure_ascii=False, indent=2))
        return client
    for index, name in enumerate(models, 1):
        print(f'{index}: {json.dumps(name, ensure_ascii=False)}')
    choice = input('Model number or exact ID: ').strip()
    if choice.isdecimal():
        number = int(choice)
        if not 1 <= number <= len(models):
            raise ValueError('Model number is out of range')
        model = models[number-1]
    else:
        model = choice
    if not model:
        raise ValueError('A model ID is required')
    client.model = model
    return client
