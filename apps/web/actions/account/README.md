# API Key Authentication with Call Recording

This module provides comprehensive API key authentication with built-in call recording capabilities for analytics and monitoring.

## Features

- **API Key Authentication**: Secure authentication using hashed API keys
- **Call Recording**: Track all API calls with detailed metadata
- **Transaction Safety**: Updates and recordings happen in database transactions
- **Client Information**: Automatic extraction of IP address and user agent
- **Response Timing**: Built-in response time measurement
- **Error Handling**: Graceful error handling that doesn't break API calls

## Database Schema

The system uses two main tables:

### ApiKey
- `id`: Unique identifier
- `organizationId`: Associated organization
- `keyHash`: Hashed API key for security
- `lastUsed`: Timestamp of last usage
- `isActive`: Whether the key is active
- `expiresAt`: Optional expiration date

### ApiCall
- `id`: Unique identifier
- `apiKeyId`: Reference to the API key used
- `organizationId`: Associated organization
- `endpoint`: API endpoint called
- `method`: HTTP method (GET, POST, etc.)
- `statusCode`: HTTP status code returned
- `responseTime`: Response time in milliseconds
- `userAgent`: Client user agent string
- `ipAddress`: Client IP address
- `createdAt`: Timestamp of the call

## Usage Examples

### 1. Basic Authentication

```typescript
import { authenticateApiKey } from "@/actions/account/api-key-auth";

const authResult = await authenticateApiKey(apiKey);
if (authResult.success) {
  // API key is valid
  console.log(authResult.organization.name);
}
```

### 2. Authentication with Call Recording

```typescript
const authResult = await authenticateApiKey(apiKey, {
  recordCall: true,
  endpoint: "/api/projects",
  method: "GET",
  statusCode: 200,
  responseTime: 150,
  userAgent: "MyApp/1.0",
  ipAddress: "192.168.1.1"
});
```

### 3. Using Middleware Function

```typescript
import { authenticateApiRequest } from "@/actions/account/api-key-auth";

const authResult = await authenticateApiRequest({
  recordCall: true,
  endpoint: "/api/projects",
  method: "GET",
  statusCode: 200
});
```

### 4. Recording Calls Separately

```typescript
// Authenticate first
const authResult = await authenticateApiRequest();

// Record the call separately
await recordApiCallFromAuth(authResult, {
  endpoint: "/api/projects",
  method: "GET",
  statusCode: 200,
  responseTime: 150
});
```

### 5. Complete API Route Example

```typescript
import { NextRequest, NextResponse } from "next/server";
import { 
  authenticateApiRequest, 
  recordApiCallFromAuth, 
  extractClientInfo 
} from "@/actions/account/api-key-auth";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let authResult: any;
  let clientInfo: any;

  try {
    // Authenticate the API request
    authResult = await authenticateApiRequest();
    
    // Extract client information from headers
    clientInfo = await extractClientInfo();

    // Your API logic here
    const data = await getProjects();
    
    const responseTime = Date.now() - startTime;
    
    // Record the successful call
    await recordApiCallFromAuth(authResult, {
      endpoint: "/api/projects",
      method: "GET",
      statusCode: 200,
      responseTime,
      ...clientInfo
    });
    
    return NextResponse.json(data);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Record the failed call
    if (authResult && clientInfo) {
      await recordApiCallFromAuth(authResult, {
        endpoint: "/api/projects",
        method: "GET",
        statusCode: error.status || 500,
        responseTime,
        ...clientInfo
      });
    }
    
    throw error;
  }
}
```

## API Reference

### `authenticateApiKey(apiKey: string, options?: ApiKeyOptions)`

Authenticates an API key and optionally records the API call.

**Parameters:**
- `apiKey`: The API key to authenticate
- `options`: Optional configuration for call recording

**Returns:**
```typescript
{
  success: boolean;
  apiKey?: ApiKey;
  organization?: Organization;
  error?: string;
}
```

### `authenticateApiRequest(options?: ApiKeyOptions)`

Middleware function that extracts API key from headers and authenticates.

**Parameters:**
- `options`: Optional configuration for call recording

**Returns:** Same as `authenticateApiKey`

### `recordApiCall(data: ApiCallData)`

Records an API call with the provided data.

**Parameters:**
```typescript
{
  apiKeyId: string;
  organizationId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
}
```

### `recordApiCallFromAuth(authResult, data)`

Convenience function to record API calls using authentication result.

### `extractClientInfo()`

Extracts client information from request headers.

**Returns:**
```typescript
{
  userAgent?: string;
  ipAddress?: string;
}
```

## Security Considerations

1. **API Key Hashing**: All API keys are hashed before storage
2. **Key Expiration**: Support for API key expiration dates
3. **Active Status**: API keys can be deactivated without deletion
4. **Organization Scoping**: All operations are scoped to organizations
5. **Transaction Safety**: Updates and recordings use database transactions

## Monitoring and Analytics

The recorded API calls provide valuable insights:

- **Usage Patterns**: Track which endpoints are most used
- **Performance Metrics**: Monitor response times
- **Error Rates**: Identify problematic endpoints
- **Client Analytics**: Understand client diversity
- **Rate Limiting**: Basis for implementing rate limiting
- **Billing**: Foundation for usage-based billing

## Error Handling

- Failed authentication throws errors that can be caught and handled
- Call recording failures are logged but don't break the API call
- Invalid API keys return appropriate error messages
- Expired or inactive keys are properly handled 