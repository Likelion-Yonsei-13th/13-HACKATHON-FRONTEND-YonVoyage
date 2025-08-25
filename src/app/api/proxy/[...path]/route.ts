import { NextRequest, NextResponse } from "next/server";

const ORIGIN = "https://pixpl.com"; // 백엔드 주소

function buildTargetURL(req: NextRequest) {
    // /api/proxy/feeds → https://pixpl.com/api/feeds
    const backendPath = req.nextUrl.pathname.replace(/^\/api\/proxy/, "");
    return `${ORIGIN}/api${backendPath}${req.nextUrl.search}`;
}

function buildForwardHeaders(req: NextRequest, method: string) {
    const headers: Record<string, string> = {};
    const userUUID = req.headers.get("x-user-uuid");
    if (userUUID) headers["X-User-UUID"] = userUUID;
    if (method !== "GET") {
        headers["Content-Type"] = req.headers.get("content-type") || "application/json";
    }
    return headers;
}

async function forward(req: NextRequest, method: "GET"|"POST"|"DELETE"|"PUT"|"PATCH") {
    const target = buildTargetURL(req);
    const headers = buildForwardHeaders(req, method);

    const init: RequestInit = { method, headers, cache: "no-store" };
    if (method !== "GET") init.body = await req.arrayBuffer();

    const res = await fetch(target, init);
    const body = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";

    return new NextResponse(body, { status: res.status, headers: { "Content-Type": contentType } });
}

export async function GET(req: NextRequest)    { return forward(req, "GET"); }
export async function POST(req: NextRequest)   { return forward(req, "POST"); }
export async function DELETE(req: NextRequest) { return forward(req, "DELETE"); }
export async function PUT(req: NextRequest)    { return forward(req, "PUT"); }
export async function PATCH(req: NextRequest)  { return forward(req, "PATCH"); }
