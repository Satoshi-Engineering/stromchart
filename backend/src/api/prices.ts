import { Router } from 'express'

import { ErrorCode } from '../../../src/data/Errors'
import type { SuccessResponse, ErrorResponse } from '../../../src/data/Response'

import { getForDateIso } from '../services/awattarPrices'

const router = Router()

router.get('/', async (req, res) => {
  if (typeof req.query.dateIso !== 'string') {
    const response: ErrorResponse = {
      status: 'error',
      message: 'Missing date parameter.',
      code: ErrorCode.InvalidInput,
    }
    res.status(400).json(response)
    return
  }
  try {
    const data = await getForDateIso(req.query.dateIso)
    const response: SuccessResponse = {
      status: 'success',
      data,
    }
    res.json(response)
  } catch (error) {
    const response: ErrorResponse = {
      status: 'error',
      message: 'Unexpected error.',
      code: ErrorCode.UnknownError,
    }
    res.status(500).json(response)
  }
})

export default router
