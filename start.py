#!/usr/bin/env python3
"""Offline launcher for a full GitHub download. No external dependencies."""
import argparse
import functools
import http.server
import json
from pathlib import Path
import sys
import webbrowser

ROOT = Path(__file__).resolve().parent / 'dist'


def check_assets():
    try:
        files = json.loads((ROOT / 'audio/manifest.json').read_text())['files']
        if len(files) != 31:
            raise ValueError('Incomplete audio manifest')
        for name in files:
            path = ROOT / 'audio' / name
            with path.open('rb') as stream:
                header = stream.read(12)
            if header[:4] != b'RIFF' or header[8:12] != b'WAVE' or path.stat().st_size <= 44:
                raise ValueError('Invalid audio: ' + name)
        for name in ['index.html', 'app.mjs', 'styles.css']:
            if not (ROOT / name).is_file():
                raise FileNotFoundError(name)
    except (OSError, ValueError, KeyError) as error:
        print('Project is incomplete:', error)
        print('Download and extract the full GitHub ZIP, including dist/audio.')
        return False
    print('Ready: application and all 31 audio files found.')
    return True


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.mjs': 'text/javascript', '.wav': 'audio/wav'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        super().end_headers()

    def log_message(self, *_args):
        pass


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--no-browser', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if not check_assets():
        return 1
    if args.check:
        return 0
    try:
        server = Server(('127.0.0.1', args.port),
                     functools.partial(Handler, directory=str(ROOT)))
    except OSError as error:
        print('Cannot start server:', error)
        print('Try another port: python3 start.py --port 8766')
        return 1
    url = 'http://127.0.0.1:' + str(server.server_port) + '/'
    print('Local: ' + url, flush=True)
    print('Click Enable sound under the keyboard. Ctrl+C stops the server.', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
