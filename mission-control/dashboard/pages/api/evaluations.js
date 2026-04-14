// API route: /api/evaluations
// GET: fetch evaluations by status (queue, pipeline, completed)
// POST: create new evaluation

import { evaluations, activity } from '../../lib/db';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { status } = req.query;

      if (status === 'queue') {
        const data = evaluations.getQueue();
        return res.status(200).json(data);
      } else if (status === 'pipeline') {
        const data = evaluations.getPipeline();
        return res.status(200).json(data);
      } else if (status === 'completed') {
        const data = evaluations.getCompleted();
        return res.status(200).json(data);
      } else {
        return res.status(400).json({ error: 'Invalid status parameter' });
      }
    }

    if (req.method === 'POST') {
      const { productName, productLine, configuration, category, priority } = req.body;

      if (!productName || !productLine || !configuration || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const eval_id = evaluations.create(
        productName,
        productLine,
        configuration,
        category,
        priority || 'Normal'
      );

      return res.status(201).json({ eval_id, status: 'Queued' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Evaluations API error:', err);
    res.status(500).json({ error: err.message });
  }
}
