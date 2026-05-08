import { isTauriRuntime } from "../platform/runtime";
import { indexedDbStorageAdapter } from "./indexedDbStorageAdapter";
import { sqliteStorageAdapter } from "./sqliteStorageAdapter";

export function getStorageAdapter() {
  return isTauriRuntime() ? sqliteStorageAdapter : indexedDbStorageAdapter;
}
