import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: string;
    timestamp: Time;
}
export interface Session {
    id: bigint;
    title: string;
    messages: Array<Message>;
}
export type Time = bigint;
export interface backendInterface {
    addMessage(sessionId: bigint, role: string, content: string): Promise<void>;
    createSession(title: string): Promise<bigint>;
    getMessages(sessionId: bigint): Promise<Array<Message>>;
    getSessions(): Promise<Array<Session>>;
}
