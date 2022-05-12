import { apiRequest } from '@server/utils/request';
import apiResponse from '@server/utils/apiResponse';

const IP_SERVICE = `https://api.iplocation.net/`;

interface LocationByIp {
  countryName: string;
  countryCode: string;
  isp: string;
}

export function apiService() {
  async function getLocationByIp(ip: string): Promise<LocationByIp> {
    const response = await apiRequest.get(IP_SERVICE, { ip });

    if (response) {
      return {
        countryName: response.country_name,
        countryCode: response.country_code2,
        isp: response.isp,
      };
    }

    throw apiResponse.error({ message: 'Error white getting location by IP' });
  }

  return {
    getLocationByIp,
  };
}
