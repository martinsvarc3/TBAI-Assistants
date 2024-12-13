import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Helper function for CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Consider restricting this to your domain
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// GET endpoint
export async function GET(request: Request) {
  try {
    // Get teamId from URL parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID (tid) is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Get the most recent performance goals for this team
    const { rows } = await pool.sql`
      SELECT 
        overall_performance_goal,
        number_of_calls_average
      FROM performance_goals 
      WHERE team_id = ${teamId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    // If no goals are set, return default values
    if (rows.length === 0) {
      return NextResponse.json({
        overall_performance_goal: 85, // Default performance goal
        number_of_calls_average: 10   // Default calls average
      }, { headers: corsHeaders() });
    }

    return NextResponse.json(rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error getting performance goals:', error);
    return NextResponse.json(
      { error: 'Failed to get performance goals' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
