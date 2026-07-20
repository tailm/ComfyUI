#!/bin/bash
# ComfyUI startup script
# Usage: ./start_comfyui.sh [start|stop|restart|status]

SERVICE_NAME="comfyui.service"

start() {
    systemctl --user start "$SERVICE_NAME"
    echo "ComfyUI started via systemd"
    status
}

stop() {
    systemctl --user stop "$SERVICE_NAME"
    echo "ComfyUI stopped"
}

restart() {
    systemctl --user restart "$SERVICE_NAME"
    echo "ComfyUI restarted"
    status
}

status() {
    systemctl --user status "$SERVICE_NAME" 2>&1 | head -15
}

case "${1:-start}" in
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    status)  status ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "ComfyUI is managed by systemd user service."
        echo "Useful commands:"
        echo "  systemctl --user start comfyui.service    # Start"
        echo "  systemctl --user stop comfyui.service     # Stop"
        echo "  systemctl --user restart comfyui.service  # Restart"
        echo "  systemctl --user status comfyui.service   # Status"
        echo "  journalctl --user -u comfyui.service -f   # View logs"
        exit 1
        ;;
esac
