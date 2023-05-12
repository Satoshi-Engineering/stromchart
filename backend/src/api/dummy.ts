import express from 'express'

import type { SuccessResponse } from '../../../src/data/Response'

const router = express.Router()

////////////////
//////// DUMMY
////
router.get('/', async (req: express.Request, res: express.Response) => {
  const response: SuccessResponse = {
    status: 'success',
    data: 'dummy',
  }
  res.json(response)
})

export default router
