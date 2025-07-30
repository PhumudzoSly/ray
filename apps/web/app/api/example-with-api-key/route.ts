import { NextRequest, NextResponse } from "next/server";
import { 
  authenticateApiRequest, 
  recordApiCallFromAuth, 
  extractClientInfo 
} from "@/actions/account/api-key-auth";

/**
 * Example API route demonstrating API key authentication with call recording
 * 
 * This route shows how to:
 * 1. Authenticate API requests using API keys
 * 2. Record API calls with timing and client information
 * 3. Handle both successful and failed requests
 * 4. Extract client information from headers
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let authResult: any;
  let clientInfo: any;

  try {
    // Authenticate the API request
    authResult = await authenticateApiRequest();
    
    // Extract client information from headers
    clientInfo = await extractClientInfo();

    // Simulate some API work
    await new Promise(resolve => setTimeout(resolve, 100));

    const responseTime = Date.now() - startTime;

    // Record the successful API call
    await recordApiCallFromAuth(authResult, {
      endpoint: "/api/example-with-api-key",
      method: "GET",
      statusCode: 200,
      responseTime,
      ...clientInfo
    });

    return NextResponse.json({
      message: "API call recorded successfully",
      organization: authResult.organization.name,
      responseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;

    // Record the failed API call if we have auth result
    if (authResult && clientInfo) {
      await recordApiCallFromAuth(authResult, {
        endpoint: "/api/example-with-api-key",
        method: "GET",
        statusCode,
        responseTime,
        ...clientInfo
      });
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Authentication failed",
        responseTime 
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let authResult: any;
  let clientInfo: any;

  try {
    // Authenticate the API request
    authResult = await authenticateApiRequest();
    
    // Extract client information from headers
    clientInfo = await extractClientInfo();

    // Parse request body
    const body = await request.json();

    // Simulate some API work
    await new Promise(resolve => setTimeout(resolve, 200));

    const responseTime = Date.now() - startTime;

    // Record the successful API call
    await recordApiCallFromAuth(authResult, {
      endpoint: "/api/example-with-api-key",
      method: "POST",
      statusCode: 201,
      responseTime,
      ...clientInfo
    });

    return NextResponse.json({
      message: "Data created successfully",
      organization: authResult.organization.name,
      data: body,
      responseTime,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;

    // Record the failed API call if we have auth result
    if (authResult && clientInfo) {
      await recordApiCallFromAuth(authResult, {
        endpoint: "/api/example-with-api-key",
        method: "POST",
        statusCode,
        responseTime,
        ...clientInfo
      });
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Request failed",
        responseTime 
      },
      { status: statusCode }
    );
  }
} 