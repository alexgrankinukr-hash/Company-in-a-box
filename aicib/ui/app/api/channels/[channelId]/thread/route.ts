import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, parsePagination } from "@/lib/api-helpers";
import { buildChannelThreadEntries, getChannelDefinition } from "@/lib/channels";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const db = getDb();
    const { channelId } = await params;
    const channel = getChannelDefinition(channelId);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const pageInfo = parsePagination(request, { pageSize: 200, maxPageSize: 500 });
    const allEntries = buildChannelThreadEntries(db).filter(
      (entry) => entry.channelId === channelId
    );

    const offset = pageInfo.offset;
    const entries = allEntries.slice(offset, offset + pageInfo.pageSize);

    return NextResponse.json({
      channel,
      entries,
      pagination: {
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        total: allEntries.length,
        totalPages: Math.max(1, Math.ceil(allEntries.length / pageInfo.pageSize)),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
