import type { Request, Response } from 'express';
import { db } from './_db';

export default {
  'GET /api/equipment': (req: Request, res: Response) => {
    const { type, availableOnly } = req.query;
    const items = db.listEquipment({
      type: type as string | undefined,
      availableOnly: availableOnly === 'true',
    });
    res.json(items);
  },
};
