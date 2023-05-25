### How to change bar colors for fixed values
* Open this [json file](https://gitlab.satoshiengineering.com/satoshiengineering/stromchart/-/tree/develop/frontend/src)
* Click on "edit"
* Update the file:
  * **optional:** you can check the typescript definition for the fees here if you want: https://gitlab.satoshiengineering.com/satoshiengineering/stromchart/-/blob/develop/frontend/src/modules/useElectricityFees.ts
  * every fee has to have the following values: id, label, color, values
  * the values have to be an array, and every entry has to have the following values:
    * validUntil, either a unix timestamp or "null" (if there is no expiration for that value)
    * amount, either a number or an array. if it's an array every entry has to have the following values:
      * validUnitl, a number with the amount of seconds passed of the current day (e.g. 60 * 60) if it's valid from 00:00 to 01:00
      * value: the amount for this timeslot
  * all arrays with ***validUntil*** have to be sorted in ascending order
  * before saving/committing the changes please check https://jsonlint.com/ if the json is valid and correctly formatted
* Click on "Comnmit changes"
* Wait 10 minutes for the changes to be deployed

### How to change bar colors for price + salesTax
* Open this [typescript file](https://gitlab.satoshiengineering.com/satoshiengineering/stromchart/-/blob/develop/frontend/src/constants.ts)
* Click on "edit"
* Update the colors for ELECTRICITY_PRICE_COLOR and ELECTRICITY_TAX_COLOR
* Click on "Comnmit changes"
* Wait 10 minutes for the changes to be deployed
