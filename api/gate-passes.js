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
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, pass_no, data, created_at 
        FROM gate_passes 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { pass_no, data } = req.body;
      const result = await sql`
        INSERT INTO gate_passes (pass_no, data)
        VALUES (${pass_no || null}, ${JSON.stringify(data || {})})
        RETURNING id, pass_no, data, created_at
      `;
      return res.status(201).json(result[0]);
    }

    if (req.method === 'PUT') {
      const { id, pass_no, data } = req.body;
      const result = await sql`
        UPDATE gate_passes
        SET pass_no = ${pass_no || null},
            data = ${JSON.stringify(data || {})},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, pass_no, data, created_at
      `;
      return res.status(200).json(result[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      await sql`DELETE FROM gate_passes WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
