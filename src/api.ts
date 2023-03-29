const blocksUrl = 'https://api.mumbainet.tzkt.io/v1/blocks';

export const getBlocksCount = async () => {
  try {
    const response = await fetch(`${blocksUrl}/count`);

    if (response.status !== 200) {
      throw new Error(`Invalid reponse from backend! HTTP code is not 200.`);
    }

    const data = await response.json();
    console.log(`Blocks count is ${data}`);
    return data;
  } catch (e) {
    console.error(e);
  }
};

export const getBlocks = async (
  select: string[] = [],
  page?: number,
  sortBy?: string,
  sortDesc?: boolean
) => {
  const paramsArray = [];
  if (select.length) {
    paramsArray.push(`select=${select.join(',')}`);
  }
  if (page !== void 0) {
    paramsArray.push(`offset.pg=${page}`);
  }
  if (sortBy) {
    paramsArray.push(`sort${sortDesc ? '.desc' : ''}=${sortBy}`);
  }
  const params = paramsArray.length ? `?${paramsArray.join('&')}` : '';
  const response = await fetch(`${blocksUrl}${params}`);

  if (response.status !== 200) {
    throw new Error(`Invalid reponse from backend! HTTP code is not 200.`);
  }

  return await response.json();
};
