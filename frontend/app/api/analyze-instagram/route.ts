/**
 * POST /api/analyze-instagram
 * Proxy to backend Instagram profile analyzer
 * 
 * Request body:
 * {
 *   "username": "peppa_foodie"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "profile": { ... },
 *   "analysis": { ... }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate request
    const body = await request.json()
    const { username } = body as { username?: string }

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: username is required'
        },
        { status: 400 }
      )
    }

    // Call backend API
    console.log(`Calling backend API for username: @${username}`)
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    const response = await fetch(`${backendUrl}/api/profile/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        {
          success: false,
          error: error.message || `Backend returned status ${response.status}`
        },
        { status: response.status }
      )
    }

    const analysisResult = await response.json()
    const processingTime = Date.now() - startTime

    return NextResponse.json(
      {
        success: true,
        ...analysisResult,
        timestamp: new Date().toISOString(),
        processingTime: `${(processingTime / 1000).toFixed(2)}s`
      },
      { status: 200 }
    )
  } catch (error) {
    const processingTime = Date.now() - startTime

    console.error('API Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        processingTime: `${(processingTime / 1000).toFixed(2)}s`
      },
      { status: 500 }
    )
  }
}

// Allow GET requests for health check
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/analyze-instagram',
    method: 'POST',
    body: {
      username: 'string (required)'
    },
    example: 'curl -X POST http://localhost:3000/api/analyze-instagram -H "Content-Type: application/json" -d \'{"username": "peppa_foodie"}\''
  })
}
