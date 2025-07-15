export class Broadcast {
    private static _instance: Broadcast;
    private _listeners: { [key: string]: Function[] } = {};

    private constructor() { }

    public static getInstance(): Broadcast {
        if (!this._instance) {
            this._instance = new Broadcast();
        }
        return this._instance;
    }

    public on(event: string, listener: Function) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(listener);
    }

    public once(event: string, listener: Function) {
        const wrapper = (data: any) => {
            listener(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    public off(event: string, listener: Function) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(l => l !== listener);
    }

    public emit(event: string, data?: any) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(listener => listener(data));
    }
}