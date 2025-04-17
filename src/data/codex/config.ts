export const codexUrl = 'https://graph.codex.io/graphql';
export const APIKEY = 'c7139420fff8ba38b52d8de871a125305b97dff2'; // '3955341b5c1c7c35294d75491fa0abfd6040cdf6';
export const codexChainId = (chainId: number, to: number = 102) => {
  if (to === 102) {
    return chainId === 102 ? 1399811149 : chainId;
  }
  return chainId === 1399811149 ? 102 : chainId;
};
export const codexHeaders = {
  'Content-Type': 'application/json',
  Authorization: APIKEY,
};
export const axiosConfig = {
  headers: codexHeaders,
};
export const queryStringify = (obj: any) => {
  return JSON.stringify(obj)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"([^"]*)"/g, '"$1"');
};

export const axiosResponse = (res: any) => {
  if (res.status === 200) {
    return res.data;
  }
  throw new Error('Axios Error: ' + res.status);
};
export const sdkResponse = (res: any) => {
  if (String(res).includes('errors') && String(res).includes('Not authorized')) {
    console.error('Codex Not authorized');
    location.reload();
  }
  if (!res.errors) {
    return {
      data: res,
    };
  }
  throw new Error('Codex SDk Error: ' + res);
};
