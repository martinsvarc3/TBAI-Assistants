import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const getDbClient = async () => {
  const client = createClient();
  await client.connect();
  return client;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  
  console.log('Received request for team ID:', teamId);
  
  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
  }

  try {
    const client = await getDbClient();
    console.log('Connected to database');
    
    const { rows } = await client.query(
      'SELECT overall_performance_goal, number_of_calls_average, team_id, created_at FROM performance_goals WHERE team_id = $1 ORDER BY created_at DESC LIMIT 1',
      [teamId]
    );
    
    console.log('Query result:', rows);
    
    await client.end();

    if (rows.length === 0) {
      console.log('No performance goals found, returning defaults');
      return NextResponse.json({
        overall_performance_goal: 85,
        number_of_calls_average: 10,
        team_id: teamId,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to load performance goals' }, { status: 500 });
  }
}
