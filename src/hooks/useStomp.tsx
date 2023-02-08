import { Client, StompConfig, StompSubscription } from "@stomp/stompjs";
import { useCallback, useEffect } from "react";

interface ObjectType {
    [key: string]: any;
}

let stompClient: Client;
let isConnected = false;
const subscriptions: {
    [key: string]: {
        unsubscribe: () => void;
        callback: (msg: any) => void;
    }
} = {};

export function useStomp(config: StompConfig, callback?: () => void) {
    const connect = useCallback(() => {
        if (!stompClient) {
            stompClient = new Client(config);
            stompClient.activate();
        }

        stompClient.onConnect = (frame) => {
            isConnected = true;
            Object.keys(subscriptions).forEach((path) => {
                const subscription = subscriptions[path];
                subscribe(path, subscription.callback);
            });
            callback && callback();
        };
    }, []);

    const send = useCallback(
        (path: string, body: ObjectType, headers: ObjectType) => {
            stompClient.publish({
                destination: path,
                headers,
                body: JSON.stringify(body),
            });
        },
        [stompClient]
    );

    const subscribe = useCallback(
        (path: string, callback: (msg: any) => void) => {
            if (!stompClient) return;

            if (subscriptions[path]) return;
            console.log("subscribing to", path);
            const subscription = stompClient.subscribe(path, (message) => {
                const body = JSON.parse(message.body);
                callback(body);
            });
            subscriptions[path] = {
                unsubscribe: subscription.unsubscribe,
                callback,
            };
        },
        []
    );

    const unsubscribe = useCallback((path: string) => {
        subscriptions[path].unsubscribe();
        delete subscriptions[path];
    }, []);

    const disconnect = useCallback(() => {
        stompClient.deactivate();
    }, [stompClient]);

    useEffect(() => {
        connect();
    }, []);

    return {
        disconnect,
        subscribe,
        unsubscribe,
        subscriptions,
        send,
        isConnected,
    };
}