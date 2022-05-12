import nodeFetch from 'node-fetch';

export const apiRequest = {
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const urlParams = new URLSearchParams(params);
    const proxyUrl = params && !url.endsWith('?') ? `${url}?${urlParams}` : `${url}${urlParams}`;

    return await (await nodeFetch(proxyUrl)).json();
  },
};
