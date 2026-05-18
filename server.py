#!/usr/bin/env python3
"""金融报告 HTML 生成工具 - 本地文件服务
零依赖，仅用 Python 3 内置模块。
启动：python3 server.py
"""
import http.server
import json
import os
import re
import sys
import urllib.parse
from datetime import datetime

PORT = 8080
REPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reports')


class ReportAPIHandler(http.server.SimpleHTTPRequestHandler):
    """自定义请求处理器：静态文件 + reports API"""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: 列出 reports 目录
        if path == '/api/reports':
            self.handle_list_reports()
            return

        # API: 读取某个 report 文件
        match = re.match(r'^/api/reports/(.+)$', path)
        if match:
            self.handle_read_report(urllib.parse.unquote(match.group(1)))
            return

        # 默认：静态文件服务
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: 保存 report 文件
        match = re.match(r'^/api/reports/(.+)$', path)
        if match:
            self.handle_save_report(urllib.parse.unquote(match.group(1)))
            return

        self.send_response(405)
        self.end_headers()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: 删除 report 文件
        match = re.match(r'^/api/reports/(.+)$', path)
        if match:
            self.handle_delete_report(urllib.parse.unquote(match.group(1)))
            return

        self.send_response(405)
        self.end_headers()

    # ---- 工具方法 ----

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def _parse_version(self, filename):
        """从文件名提取 baseName 和 version，如 '报告_v003_20250114.html'"""
        name_no_ext = os.path.splitext(filename)[0]
        match = re.match(r'^(.+)_v(\d+)_(\d{8}_\d{4})$', name_no_ext)
        if match:
            return match.group(1), int(match.group(2)), match.group(3)
        match = re.match(r'^(.+)_v(\d+)$', name_no_ext)
        if match:
            return match.group(1), int(match.group(2)), ''
        return name_no_ext, 0, ''

    # ---- API 处理方法 ----

    def handle_list_reports(self):
        if not os.path.isdir(REPORTS_DIR):
            os.makedirs(REPORTS_DIR, exist_ok=True)

        files = []
        for fname in os.listdir(REPORTS_DIR):
            fpath = os.path.join(REPORTS_DIR, fname)
            if not os.path.isfile(fpath):
                continue
            if not fname.endswith('.html'):
                continue

            stat = os.stat(fpath)
            base, version, timestamp = self._parse_version(fname)
            files.append({
                'name': fname,
                'baseName': base,
                'version': version,
                'timestamp': timestamp,
                'size': stat.st_size,
                'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            })

        # 按修改时间倒序
        files.sort(key=lambda f: f['modified'], reverse=True)
        self._send_json({'files': files})

    def handle_read_report(self, filename):
        safe_name = os.path.basename(filename)  # 防止目录穿越
        fpath = os.path.join(REPORTS_DIR, safe_name)

        if not os.path.isfile(fpath):
            self._send_json({'error': '文件不存在'}, 404)
            return

        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(content.encode('utf-8')))
        self.end_headers()
        self.wfile.write(content.encode('utf-8'))

    def handle_save_report(self, filename):
        safe_name = os.path.basename(filename)
        fpath = os.path.join(REPORTS_DIR, safe_name)
        os.makedirs(REPORTS_DIR, exist_ok=True)

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(body)

        self._send_json({'success': True, 'path': fpath})

    def handle_delete_report(self, filename):
        safe_name = os.path.basename(filename)
        fpath = os.path.join(REPORTS_DIR, safe_name)

        if not os.path.isfile(fpath):
            self._send_json({'error': '文件不存在'}, 404)
            return

        os.remove(fpath)
        self._send_json({'success': True})

    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


if __name__ == '__main__':
    os.makedirs(REPORTS_DIR, exist_ok=True)
    print(f'🚀 金融报告 HTML 生成工具')
    print(f'   本地服务已启动：http://localhost:{PORT}')
    print(f'   报告存储目录：{REPORTS_DIR}')
    print(f'   按 Ctrl+C 关闭服务\n')

    handler = ReportAPIHandler
    server = http.server.HTTPServer(('0.0.0.0', PORT), handler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n服务已关闭')
        server.shutdown()
        sys.exit(0)
