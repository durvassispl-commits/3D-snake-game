import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Entry {
    score: bigint;
    playerName: string;
}
export interface backendInterface {
    getAllEntries(): Promise<Array<Entry>>;
    getPersonalBest(playerName: string): Promise<bigint>;
    getTopEntries(): Promise<Array<Entry>>;
    submitScore(playerName: string, score: bigint): Promise<void>;
}
