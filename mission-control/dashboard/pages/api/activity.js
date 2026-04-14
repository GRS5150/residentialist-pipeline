// API route: /api/activity
// GET: fetch recent activity log

import { activity } from '../../lib/db';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { eval_id, spec_id, limit } = req.query;

      if (eval_id) {
        const data = activity.getForEval(eval_id, limit ? parseInt(limit) : 20);
        return res.status(200).json(data);
      } else if (spec_id) {
        const data = activity.getForSpec(spec_id, limit ? parseInt(limit) : 20);
        return res.status(200).json(data);
      } else {
        const data = activity.getRecent(limit ? parseInt(limit) : 50);
        return res.status(200).json(data);
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Activity API error:', err);
    res.status(500).json({ error: err.message });
  }
}
