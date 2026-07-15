#!/usr/bin/env python3
"""将 ComfyUI_frontend/dist/ 的构建产物同步到 web/ 目录"""

import os
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "ComfyUI_frontend", "dist")
WEB_DIR = os.path.join(BASE_DIR, "web")


def sync():
    if not os.path.isdir(DIST_DIR):
        print(f"错误: 前端构建产物不存在: {DIST_DIR}")
        print("请先执行: cd ComfyUI_frontend && pnpm build")
        return 1

    index_html = os.path.join(DIST_DIR, "index.html")
    if not os.path.isfile(index_html):
        print(f"错误: 构建产物不完整，缺少 index.html")
        return 1

    # 清空 web 目录
    if os.path.isdir(WEB_DIR):
        for item in os.listdir(WEB_DIR):
            path = os.path.join(WEB_DIR, item)
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)

    # 复制构建产物
    for item in os.listdir(DIST_DIR):
        src = os.path.join(DIST_DIR, item)
        dst = os.path.join(WEB_DIR, item)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)

    print(f"前端同步完成: {DIST_DIR} -> {WEB_DIR}")
    return 0


if __name__ == "__main__":
    exit(sync())
