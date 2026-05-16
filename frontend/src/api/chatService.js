import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class ChatService {
    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.pendingSubscriptions = [];
    }

    connect(onConnected) {
        // If already connected, just call the callback
        if (this.client && this.client.connected) {
            if (onConnected) onConnected();
            return;
        }

        // If connecting in progress, queue the callback
        if (this.client && !this.client.connected) {
            this.client.deactivate();
        }

        const token = localStorage.getItem('token');

        this.client = new Client({
            webSocketFactory: () => new SockJS('/ws-chat'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('[Chat] Connected to WebSocket');
                // Flush any pending subscriptions
                this.pendingSubscriptions.forEach(({ tripId, callback }) => {
                    this.doSubscribe(tripId, callback);
                });
                this.pendingSubscriptions = [];
                if (onConnected) onConnected();
            },
            onStompError: (frame) => {
                console.error('[Chat] Broker error:', frame.headers['message']);
            },
            onDisconnect: () => {
                console.log('[Chat] Disconnected');
            }
        });

        this.client.activate();
    }

    subscribe(tripId, callback) {
        if (this.client && this.client.connected) {
            this.doSubscribe(tripId, callback);
        } else {
            // Queue subscription for when connected
            this.pendingSubscriptions.push({ tripId, callback });
        }
    }

    doSubscribe(tripId, callback) {
        // Avoid duplicate subscriptions
        if (this.subscriptions.has(tripId)) {
            this.subscriptions.get(tripId).unsubscribe();
        }
        const topic = `/topic/trip/${tripId}`;
        const sub = this.client.subscribe(topic, (message) => {
            try {
                callback(JSON.parse(message.body));
            } catch (e) {
                console.error('[Chat] Failed to parse message:', e);
            }
        });
        this.subscriptions.set(tripId, sub);
    }

    unsubscribe(tripId) {
        const sub = this.subscriptions.get(tripId);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(tripId);
        }
        // Also clear from pending
        this.pendingSubscriptions = this.pendingSubscriptions.filter(p => p.tripId !== tripId);
    }

    sendMessage(tripId, content) {
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: `/app/chat/${tripId}`,
                body: content,
                headers: { 'content-type': 'text/plain' }
            });
        } else {
            console.warn('[Chat] Cannot send — not connected');
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.subscriptions.clear();
        this.pendingSubscriptions = [];
    }
}

export default new ChatService();
