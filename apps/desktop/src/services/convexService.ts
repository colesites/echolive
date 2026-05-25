import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { convex, env } from "../lib/convex";

export type StreamId = Id<"streams">;
export type StorageId = Id<"_storage">;

export interface StartedStream {
  streamId: StreamId;
  slug: string;
  streamKey: string;
  rtmpUrl: string;
  hlsUrl: string;
  shareUrl: string;
}

/**
 * Upload a cover image to Convex Storage, returning the storage id. Pass
 * the id into `startStream` to bind it to the new stream session.
 */
export async function uploadCover(file: File): Promise<StorageId> {
  const uploadUrl = await convex.mutation(
    api.streams.generateCoverUploadUrl,
    {},
  );
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Cover upload failed: ${res.status} ${res.statusText}`);
  }
  const { storageId } = (await res.json()) as { storageId: StorageId };
  return storageId;
}

/**
 * Create a brand-new stream session + mint its key. Returns URLs for the
 * desktop to pass to FFmpeg and to display as a share link.
 */
export async function startStream(args: {
  title: string;
  coverStorageId?: StorageId;
}): Promise<StartedStream> {
  return await convex.mutation(api.streams.startStream, {
    title: args.title,
    coverStorageId: args.coverStorageId,
    rtmpHost: env.rtmpHost,
    hlsHost: env.hlsHost,
    webHost: env.webHost,
  });
}

export async function markPublishStarted(streamId: StreamId): Promise<void> {
  await convex.mutation(api.streams.markPublishStarted, { streamId });
}

export async function endStream(streamId: StreamId): Promise<void> {
  await convex.mutation(api.streams.endStream, { streamId });
}

/** Emergency cleanup — flips every stuck "live"/"connecting" stream to ended. */
export async function endAllLive(): Promise<{ ended: number }> {
  return await convex.mutation(api.streams.endAllLive, {});
}

export async function updateTitle(
  streamId: StreamId,
  title: string,
): Promise<void> {
  await convex.mutation(api.streams.updateTitle, { streamId, title });
}
