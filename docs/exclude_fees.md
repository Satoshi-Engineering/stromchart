### How to exclude certain static fees
* add "excludeFees" as get parameter with a list of fees that should be excluded
* the values are the ids of the fees from https://gitlab.satoshiengineering.com/satoshiengineering/stromchart/-/blob/develop/frontend/src/fees.json
* e.g. https://stromchart.sate.tools/?excludeFees=infrastructureFee,electricityFee
