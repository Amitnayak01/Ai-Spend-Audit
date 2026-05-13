import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Audit } from "@/lib/db/models";

// GET /api/share?shareId=xxx
export async function GET(request: NextRequest) {
  const shareId = request.nextUrl.searchParams.get("shareId");

  if (!shareId) {
    return NextResponse.json(
      { success: false, error: "Share ID required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const audit = await Audit.findOne({ shareId }).select(
      "id shareId summary recommendations aiSummary createdAt formData.teamSize formData.industry formData.tools"
    );

    if (!audit) {
      return NextResponse.json(
        { success: false, error: "Report not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: audit.id,
        shareId: audit.shareId,
        summary: audit.summary,
        recommendations: audit.recommendations,
        aiSummary: audit.aiSummary,
        createdAt: audit.createdAt,
        teamInfo: {
          teamSize: audit.formData?.teamSize,
          industry: audit.formData?.industry,
          toolCount: audit.formData?.tools?.length,
        },
      },
    });
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
