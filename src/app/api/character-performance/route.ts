import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://app.trainedbyai.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

interface PerformanceMetrics {
  overall_performance: number;
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const teamId = searchParams.get('teamId');
    const characterName = searchParams.get('characterName');

    if (!memberId && !teamId) {
      return NextResponse.json(
        { error: 'Member ID or Team ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // If only teamId is provided, return performance goals
    if (teamId && !memberId && !characterName) {
      const settingsResult = await pool.sql`
        SELECT 
          past_calls_count,
          overall_performance_goal
        FROM team_settings 
        WHERE team_id = ${teamId}`;
      
      const settings = settingsResult.rows[0] || { 
        past_calls_count: 10,
        overall_performance_goal: 85
      };

      // Return in the format expected by the frontend
      return NextResponse.json({
        overall_performance_goal: settings.overall_performance_goal || 85,
        number_of_calls_average: settings.past_calls_count || 10
      }, { headers: corsHeaders() });
    }

    // Get the past_calls_count setting for this team
    const settingsResult = await pool.sql`
      SELECT past_calls_count 
      FROM team_settings 
      WHERE team_id = ${teamId}`;

    const pastCallsCount = settingsResult.rows[0]?.past_calls_count || 10;

    // Get metrics based on past X calls
    const { rows } = await pool.sql`
      WITH recent_calls AS (
        SELECT *
        FROM character_interactions
        WHERE member_id = ${memberId}
          AND team_id = ${teamId}
          AND character_name = ${characterName}
        ORDER BY session_date DESC
        LIMIT ${pastCallsCount}
      )
      SELECT 
        ROUND(AVG(overall_performance)) as overall_performance,
        ROUND(AVG(engagement)) as engagement,
        ROUND(AVG(objection_handling)) as objection_handling,
        ROUND(AVG(information_gathering)) as information_gathering,
        ROUND(AVG(program_explanation)) as program_explanation,
        ROUND(AVG(closing_skills)) as closing_skills,
        ROUND(AVG(overall_effectiveness)) as overall_effectiveness,
        COUNT(*) as total_calls
      FROM recent_calls;
    `;

    return NextResponse.json(rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      memberId,
      teamId,
      characterName,
      metrics
    }: {
      memberId: string;
      teamId: string;
      characterName: string;
      metrics: PerformanceMetrics;
    } = body;

    if (!memberId || !teamId || !characterName || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Insert new interaction
    await pool.sql`
      INSERT INTO character_interactions (
        member_id,
        team_id,
        character_name,
        overall_performance,
        engagement,
        objection_handling,
        information_gathering,
        program_explanation,
        closing_skills,
        overall_effectiveness
      ) VALUES (
        ${memberId},
        ${teamId},
        ${characterName},
        ${metrics.overall_performance},
        ${metrics.engagement},
        ${metrics.objection_handling},
        ${metrics.information_gathering},
        ${metrics.program_explanation},
        ${metrics.closing_skills},
        ${metrics.overall_effectiveness}
      )
    `;

    // Get the past_calls_count setting for this team
    const settingsResult = await pool.sql`
      SELECT past_calls_count 
      FROM team_settings 
      WHERE team_id = ${teamId}`;

    const pastCallsCount = settingsResult.rows[0]?.past_calls_count || 10;

    // Return updated metrics
    const { rows } = await pool.sql`
      WITH recent_calls AS (
        SELECT *
        FROM character_interactions
        WHERE member_id = ${memberId}
          AND team_id = ${teamId}
          AND character_name = ${characterName}
        ORDER BY session_date DESC
        LIMIT ${pastCallsCount}
      )
      SELECT 
        ROUND(AVG(overall_performance)) as overall_performance,
        ROUND(AVG(engagement)) as engagement,
        ROUND(AVG(objection_handling)) as objection_handling,
        ROUND(AVG(information_gathering)) as information_gathering,
        ROUND(AVG(program_explanation)) as program_explanation,
        ROUND(AVG(closing_skills)) as closing_skills,
        ROUND(AVG(overall_effectiveness)) as overall_effectiveness,
        COUNT(*) as total_calls
      FROM recent_calls;
    `;

    return NextResponse.json(rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// PUT endpoint for updating team settings
export async function PUT(request: Request) {
  try {
    const { teamId, pastCallsCount, overall_performance_goal } = await request.json();

    if (!teamId || !pastCallsCount) {
      return NextResponse.json(
        { error: 'Team ID and past calls count are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Update or insert team settings
    await pool.sql`
      INSERT INTO team_settings (
        team_id, 
        past_calls_count, 
        overall_performance_goal
      )
      VALUES (
        ${teamId}, 
        ${pastCallsCount}, 
        ${overall_performance_goal || 85}
      )
      ON CONFLICT (team_id) 
      DO UPDATE SET 
        past_calls_count = ${pastCallsCount},
        overall_performance_goal = ${overall_performance_goal || 85},
        last_updated = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
