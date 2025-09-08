from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class AngularHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # If the file exists, serve it normally
        if os.path.exists(self.translate_path(self.path)):
            return SimpleHTTPRequestHandler.do_GET(self)

        # Otherwise, serve index.html for Angular routing
        self.path = '/index.html'
        return SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 80), AngularHandler)
    print('Starting server on port 80...')
    server.serve_forever()
