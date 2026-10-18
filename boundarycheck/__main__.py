import argparse
import json
import os
from pathlib import Path
import sqlite3

from .core import APIClient, MockClient, run, validate_config, write_reports


def main():
    parser = argparse.ArgumentParser(description='Controlled boundary-consistency tests with unchanged-request controls')
    commands = parser.add_subparsers(dest='command', required=True)
    for name in ('plan', 'run'):
        command = commands.add_parser(name)
        command.add_argument('--config', type=Path, required=True)
        if name == 'run':
            command.add_argument('--mode', choices=('mock','live'), default='mock')
            command.add_argument('--output', type=Path, required=True)
    command = commands.add_parser('report')
    command.add_argument('--db', type=Path, required=True)
    command.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == 'report':
            args.output.mkdir(parents=True,exist_ok=True)
            with sqlite3.connect(args.db.resolve().as_uri()+'?mode=ro',uri=True) as connection:
                report = write_reports(connection,args.output)
        else:
            config = json.loads(args.config.read_text(encoding='utf-8'))
            count = validate_config(config)
            if args.command == 'plan':
                print(json.dumps(dict(planned_calls=count, budget=config['max_requests'], repetitions=config['repetitions'],
                    design='four independent calls per repetition: baseline, changed, unchanged control A/B',
                    network_calls=0), ensure_ascii=False,indent=2))
                return 0
            client = MockClient(config['seed']) if args.mode == 'mock' else APIClient(os.environ)
            report = run(config,args.output,client,args.mode)
        print(json.dumps(dict(mode=report['mode'],model=report['model'],statuses=report['statuses'],
            report=str(args.output/'report.md')),ensure_ascii=False,indent=2))
        return 1 if any(status != 'completed' for status in report['statuses']) else 0
    except (ValueError, KeyError, FileNotFoundError, FileExistsError, json.JSONDecodeError) as error:
        # Configuration errors are local, controlled messages. API errors are recorded by type in SQLite.
        if isinstance(error,FileExistsError):
            parser.error('Output database already exists; choose a fresh output directory')
        if isinstance(error,FileNotFoundError):
            parser.error('Input path not found')
        if isinstance(error,KeyError):
            parser.error('Input is missing a required field')
        parser.error(str(error))


if __name__ == '__main__':
    raise SystemExit(main())
