import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Only track API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip tracking for internal API routes
  if (request.nextUrl.pathname.startsWith('/api/auth/') || 
      request.nextUrl.pathname.startsWith('/api/projects/') ||
      request.nextUrl.pathname === '/api/usage') {
    return NextResponse.next();
  }

  const startTime = Date.now();
  
  // Extract project ID from URL or authorization header
  const projectId = request.nextUrl.pathname.split('/')[3]; // Assuming URL pattern: /api/v1/{projectId}/...
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!projectId || !apiKey) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing project ID or API key' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    // Verify API key belongs to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        apiKey
      }
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // Check rate limits
    const rateLimit = await checkRateLimit(`${projectId}:${apiKey}`);
    
    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset
        }),
        { 
          status: 429,
          headers: {
            'content-type': 'application/json',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString()
          }
        }
      );
    }

    // Proceed with the request
    const response = await NextResponse.next();
    const duration = Date.now() - startTime;

    // Log API usage
    await prisma.auditLog.create({
      data: {
        action: 'API_CALL',
        entityType: 'api',
        entityId: projectId,
        userId: project.userId,
        projectId: project.id,
        metadata: {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          statusCode: response.status,
          duration,
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.ip || request.headers.get('x-forwarded-for'),
          rateLimit: {
            remaining: rateLimit.remaining,
            reset: rateLimit.reset
          }
        }
      }
    });

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString());

    return response;
  } catch (error) {
    console.error('Error in API middleware:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
} 