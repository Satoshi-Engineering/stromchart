let EXPRESS_PORT = 4000
if (Number(process.env.EXPRESS_PORT) > 0 && Number(process.env.EXPRESS_PORT) < 65536) {
  EXPRESS_PORT = Number(process.env.EXPRESS_PORT)
}

export {
  EXPRESS_PORT,
}
