export function simpleAddress(address: string, len: number = 4) {
  let leng = len || 4;
  let lastLen = 4;
  if (len) {
    lastLen = len;
  }
  if (!address) return address;
  if (address.length > leng * 2 + 3) {
    return (
      address.substring(0, leng) +
      '...' +
      address.substring(address.length - lastLen, address.length)
    );
  } else {
    return address;
  }
}

export function strToNumberByDecimals(str: string, decimals: number) {
  if (!str) return 0;
  return Number(str) / Math.pow(10, decimals);

}