let EXPRESS_PORT = 4000
if (Number(process.env.EXPRESS_PORT) > 0 && Number(process.env.EXPRESS_PORT) < 65536) {
  EXPRESS_PORT = Number(process.env.EXPRESS_PORT)
}

let PRICES_DATA_DIR = '../data'
if (process.env.PRICES_DATA_DIR != null && process.env.PRICES_DATA_DIR.length > 0) {
  PRICES_DATA_DIR = process.env.PRICES_DATA_DIR
}

export {
  EXPRESS_PORT,
  PRICES_DATA_DIR,
}
