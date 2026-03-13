import { useEffect, useRef, useState, useCallback } from "react";
export function useWebSocket({ url, onMessage, autoConnect = true }) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const wsRef = useRef(null);
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN)
            return;
        const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
        const wsUrl = baseUrl.replace(/^http/, "ws") + url;
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);
        ws.onerror = () => setIsConnected(false);
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
                onMessage?.(data);
            }
            catch {
                // ignore non-JSON messages
            }
        };
        wsRef.current = ws;
    }, [url, onMessage]);
    const disconnect = useCallback(() => {
        wsRef.current?.close();
        wsRef.current = null;
        setIsConnected(false);
    }, []);
    useEffect(() => {
        if (autoConnect)
            connect();
        return () => disconnect();
    }, [autoConnect, connect, disconnect]);
    return { isConnected, lastMessage, connect, disconnect };
}
