const CONVEX_URL = "http://localhost:3001";

export interface StreamDocument {
  _id: string;
  _creationTime: number;
  title: string;
  isLive: boolean;
  listeners: number;
  startedAt?: number;
}

/**
 * Calls a Convex query over HTTP.
 */
async function convexQuery<T>(funcName: string, args: Record<string, unknown> = {}): Promise<T> {
  const url = `${CONVEX_URL}/api/query/${funcName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Convex query ${funcName} failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  // Convex HTTP API query returns the value directly, or wrapped in an object
  return result as T;
}

/**
 * Calls a Convex mutation over HTTP.
 */
async function convexMutation<T>(funcName: string, args: Record<string, unknown> = {}): Promise<T> {
  const url = `${CONVEX_URL}/api/mutation/${funcName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Convex mutation ${funcName} failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  return result as T;
}

export async function fetchLiveStream(): Promise<StreamDocument> {
  return convexQuery<StreamDocument>("streams/getLiveStream");
}

export async function setLiveStreamStatus(id: string, isLive: boolean, title?: string): Promise<void> {
  return convexMutation<void>("streams/updateStreamStatus", { id, isLive, title });
}

export async function setLiveStreamTitle(id: string, title: string): Promise<void> {
  return convexMutation<void>("streams/updateStreamTitle", { id, title });
}
