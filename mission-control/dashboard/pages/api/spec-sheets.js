// API route: /api/spec-sheets
// GET: fetch spec sheets in review queue
// POST: approve or discard spec sheet

import { specSheets } from '../../lib/db';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const data = specSheets.getById(id);
        if (!data) {
          return res.status(404).json({ error: 'Spec sheet not found' });
        }
        return res.status(200).json(data);
      } else {
        const data = specSheets.getReviewQueue();
        return res.status(200).json(data);
      }
    }

    if (req.method === 'POST') {
      const { action, spec_id, notes } = req.body;

      if (!action || !spec_id) {
        return res.status(400).json({ error: 'Missing action or spec_id' });
      }

      if (action === 'approve') {
        specSheets.approve(spec_id, notes || '');
        return res.status(200).json({ status: 'approved', spec_id });
      } else if (action === 'discard') {
        specSheets.discard(spec_id, notes || '');
        return res.status(200).json({ status: 'discarded', spec_id });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Spec sheets API error:', err);
    res.status(500).json({ error: err.message });
  }
}
