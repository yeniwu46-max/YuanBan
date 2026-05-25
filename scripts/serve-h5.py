"""H5 static server + optional API reverse proxy (single port for phones)."""
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

API_UPSTREAM = "http://127.0.0.1:8000"


class SpaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def _proxy_api(self) -> bool:
        path = self.path.split("?", 1)[0]
        if path in ("/health", "/docs", "/openapi.json", "/redoc") or path.startswith("/api/"):
            upstream = f"{API_UPSTREAM}{self.path}"
            try:
                body = None
                headers = {}
                if self.command in ("POST", "PATCH", "PUT"):
                    length = int(self.headers.get("Content-Length", 0))
                    body = self.rfile.read(length) if length else None
                    if self.headers.get("Content-Type"):
                        headers["Content-Type"] = self.headers.get("Content-Type")
                req = urllib.request.Request(
                    upstream, data=body, method=self.command, headers=headers
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = resp.read()
                    self.send_response(resp.status)
                    for key, val in resp.headers.items():
                        if key.lower() in ("transfer-encoding", "connection"):
                            continue
                        self.send_header(key, val)
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(data)
                return True
            except urllib.error.HTTPError as err:
                data = err.read()
                self.send_response(err.code)
                self.send_header("Content-Type", err.headers.get("Content-Type", "application/json"))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
                return True
            except Exception:
                self.send_error(502, "API upstream unavailable")
                return True
        return False

    def do_GET(self):
        if self._proxy_api():
            return
        return self._serve_spa()

    def do_HEAD(self):
        if self._proxy_api():
            return
        return self._serve_spa(head_only=True)

    def do_POST(self):
        if self._proxy_api():
            return
        self.send_error(405)

    def do_PATCH(self):
        if self._proxy_api():
            return
        self.send_error(405)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def _serve_spa(self, head_only: bool = False):
        path = Path(self.translate_path(self.path))
        if not path.is_file():
            self.path = "/index.html"
        if head_only:
            return super().do_HEAD()
        return super().do_GET()


def main() -> None:
    if len(sys.argv) < 4:
        print("Usage: serve-h5.py <h5_dir> <host> <port>")
        sys.exit(1)
    root = Path(sys.argv[1]).resolve()
    host = sys.argv[2]
    port = int(sys.argv[3])
    if not root.is_dir():
        print(f"Directory not found: {root}")
        sys.exit(1)
    handler = lambda *args, **kwargs: SpaHandler(*args, directory=str(root), **kwargs)
    server = ThreadingHTTPServer((host, port), handler)
    print(f"Serving H5 + API proxy at http://{host}:{port}/ from {root}")
    print(f"API upstream: {API_UPSTREAM}")
    server.serve_forever()


if __name__ == "__main__":
    main()
