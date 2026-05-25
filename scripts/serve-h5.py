"""简易 H5 静态服务，支持 SPA 回退（无需 Docker / Nginx）。"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class SpaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        path = Path(self.translate_path(self.path))
        if path.is_file():
            return super().do_GET()
        self.path = "/index.html"
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
    print(f"Serving H5 at http://{host}:{port}/ from {root}")
    server.serve_forever()


if __name__ == "__main__":
    main()
