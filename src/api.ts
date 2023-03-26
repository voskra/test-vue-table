export const getBlocsCount = async () => {
  try {
    const response = await fetch(
      `https://api.mumbainet.tzkt.io/v1/blocks/count`
    );

    if (response.status !== 200) {
      throw new Error(`Invalid reponse from backend! HTTP code is not 200.`);
    }

    const data = await response.json();
    console.log(`Blocs count is ${data}`);
    return data;
  } catch (e) {
    console.error(e);
  }
};

export const getBlocs = async (
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
  const response = await fetch(
    `https://api.mumbainet.tzkt.io/v1/blocks${params}`
  );

  if (response.status !== 200) {
    throw new Error(`Invalid reponse from backend! HTTP code is not 200.`);
  }

  return await response.json();
};
