import axios from 'axios'
import { DateTime } from 'luxon'
import fs from 'fs'
import path from 'path'

import { ErrorCode } from '../../../src/data/Errors'

import { PRICES_DATA_DIR } from '../constants'

/**
 * day formatted as YYYY-MM-DD
 * 
 * @throws
 */
export const getForDateIso = async (dateIso: string): Promise<unknown> => {
  const filename = path.join(PRICES_DATA_DIR, `awattar_${dateIso}.json`)
  try {
    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, 'utf8'))
    }
  } catch (error) {
    console.error(ErrorCode.UnableToReadAwattarData, filename, error)
    throw error
  }
  try {
    const targetDate = DateTime.fromISO(dateIso).startOf('day')
    const start = targetDate.toMillis()
    const end = targetDate.plus({ days: 1 }).endOf('day').toMillis()
    const { data } = await axios.get(`https://api.awattar.at/v1/marketdata?start=${start}&end=${end}`)
    setTimeout(() => {
      try {
        if (data.data.length === 0) {
          return
        }
        fs.writeFileSync(filename, JSON.stringify(data.data), 'utf8')
      } catch (error) {
        console.error(ErrorCode.UnableToWriteAwattarData, filename, error)
      }
    }, 1)
    return data.data
  } catch (error) {
    console.error(ErrorCode.UnableToLoadDataFromAwattar, error)
    throw error
  }
}
