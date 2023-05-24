import axios from 'axios'
import fs from 'fs'
import path from 'path'

import { ErrorCode } from '../../../src/data/Errors'

import { PRICES_DATA_DIR } from '../constants'

/**
 * day formatted as YYYY-MM-DD
 * 
 * @throws
 */
export const getForDay = async (date: string): Promise<unknown> => {
  const filename = path.join(PRICES_DATA_DIR, `awattar_${date}.json`)
  try {
    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, 'utf8'))
    }
  } catch (error) {
    console.error(ErrorCode.UnableToReadAwattarData, filename, error)
    throw error
  }
  try {
    const targetDate = new Date(date)
    const start = targetDate.getTime() - (1000 * 60 * 60 * 2) // subtract 2 hours as we want the data from 00:00 - 24:00 vienna time
    const end = start + (1000 * 60 * 60 * 24)
    const { data } = await axios.get(`https://api.awattar.at/v1/marketdata?start=${start}&end=${end}`)
    setTimeout(() => {
      try {
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
