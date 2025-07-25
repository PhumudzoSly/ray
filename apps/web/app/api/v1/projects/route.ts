import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/actions/account/api-key-auth";
import { hasPermission } from "@/lib/api-key-utils";
import { prisma } from "@workspace/backend";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the API request
    const authResult = await authenticateApiRequest();

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { apiKey, organization } = authResult;

    // Check if the API key has the required permission
    if (!hasPermission(apiKey.permissions, "READ")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Fetch projects for the organization
    const projects = await prisma.project.findMany({
      where: {
        organizationId: organization.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      organization: {
        id: organization.id,
        name: organization.name,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the API request
    const authResult = await authenticateApiRequest();

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { apiKey, organization } = authResult;

    // Check if the API key has the required permission
    if (!hasPermission(apiKey.permissions, "WRITE")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create a new project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        organizationId: organization.id,
        createdById: apiKey.createdBy,
        status: "planning",
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
