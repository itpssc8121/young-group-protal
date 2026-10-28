import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, pass_no, data, created_at
        FROM gate_passes
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const pass_no = body.pass_no || body.passNo || null;
      const data = body.data || body;
      const result = await sql`
        INSERT INTO gate_passes (pass_no, data)
        VALUES (${pass_no}, ${JSON.stringify(data)}::jsonb)
        RETURNING id, pass_no, data, created_at
      `;
      return res.status(201).json(result[0]);
    }

    if (req.method === 'PUT') {
      const id = body.id;
      const pass_no = body.pass_no || body.passNo || null;
      const data = body.data || body;
      const result = await sql`
        UPDATE gate_passes
        SET pass_no = ${pass_no},
            data = ${JSON.stringify(data)}::jsonb,
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, pass_no, data, created_at
      `;
      return res.status(200).json(result[0]);
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM gate_passes WHERE id = ${body.id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
