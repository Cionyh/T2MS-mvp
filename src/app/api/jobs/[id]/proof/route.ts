import { NextRequest, NextResponse } from "next/server";
import { verifyWorker } from "@/lib/worker-helpers";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

/**
 * POST /api/jobs/:id/proof
 * Upload proof for a job
 * Note: This is a basic implementation. For production, integrate with S3
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Only workers can upload proof" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "desktop" | "mobile" | "message"

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be PNG, JPG, or PDF" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["desktop", "mobile", "message"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be desktop, mobile, or message" },
        { status: 400 }
      );
    }

    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.assignedWorkerId !== worker.id) {
      return NextResponse.json(
        { error: "You can only upload proof for jobs assigned to you" },
        { status: 403 }
      );
    }

    // TODO: Upload to S3 and get URL
    // For now, we'll store a placeholder
    // In production, use AWS SDK to upload to S3
    const fileUrl = `/uploads/${params.id}/${type}-${Date.now()}-${file.name}`;

    // Create proof record
    const proof = await prisma.proof.create({
      data: {
        jobId: params.id,
        type,
        fileUrl,
        fileSize: file.size,
      },
    });

    // Check if all required proofs are uploaded
    const proofs = await prisma.proof.findMany({
      where: { jobId: params.id },
    });

    const hasDesktop = proofs.some((p) => p.type === "desktop");
    const hasMobile = proofs.some((p) => p.type === "mobile");
    const hasMessage = proofs.some((p) => p.type === "message");

    const allProofsUploaded = hasDesktop && hasMobile && hasMessage;

    // Update job proof status
    await prisma.installJob.update({
      where: { id: params.id },
      data: {
        proofUploaded: allProofsUploaded,
      },
    });

    return NextResponse.json({
      success: true,
      proof,
      allProofsUploaded,
      message: "Proof uploaded successfully",
    });
  } catch (error: any) {
    console.error("[JOBS_PROOF]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
