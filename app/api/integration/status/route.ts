import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

/**
 * GET /api/integration/status
 * BasaltCMS integration status endpoint for Echo connection and softphone config.
 *
 * Response:
 * {
 *   echo_connected: boolean,
 *   iframeSrc: string,     // e.g., https://basaltcrm.my.connect.aws/ccp-v2/
 *   iframeOrigin: string,  // e.g., https://basaltcrm.my.connect.aws
 *   queueId?: string,
 *   flowId?: string
 * }
 *
 * Notes:
 * - This is a scaffold returning environment-derived softphone config and a placeholder connection flag.
 * - Final implementation should compute echo_connected from stored OAuth tokens / connection state.
 * - queueId/flowId can be populated from workspace configuration if applicable.
 */

export async function GET(_req: NextRequest) {
  try {
    const base = String(process.env.NEXT_PUBLIC_CONNECT_BASE_URL || "").trim();
    if (!base || !/^https?:\/\//i.test(base)) {
      return NextResponse.json(
        { ok: false, error: "invalid_connect_base_url" },
        { status: 500 }
      );
    }

    // Resolve Echo connection and wallet from CRM persistence (systemServices) and env
    let echoConnected = false;
    let echoWallet: string | null = null;
    try {
      const svc = await prismadb.systemServices.findFirst({ where: { name: "echo" } });
      const configuredBase = String(process.env.ECHO_BASE_URL || process.env.NEXT_PUBLIC_ECHO_BASE_URL || "").trim();
      echoConnected = !!(configuredBase || (svc?.serviceUrl && String(svc.serviceUrl).trim()));
      echoWallet = svc?.serviceId ? String(svc.serviceId).trim().toLowerCase() : null;
    } catch {}

    const iframeSrc = `${base.replace(/\/+$/, "")}/ccp-v2/`;
    const iframeOrigin = base.replace(/\/+$/, "");

    // Optional queue/flow identifiers from env (or workspace config)
    const queueId = process.env.CONNECT_QUEUE_ID;
    const flowId = process.env.CONNECT_CONTACT_FLOW_ID;

    return NextResponse.json(
      {
        echo_connected: echoConnected,
        echo_wallet: echoWallet,
        iframeSrc,
        iframeOrigin,
        ...(queueId ? { queueId } : {}),
        ...(flowId ? { flowId } : {}),
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "failed" },
      { status: 500 }
    );
  }
}
