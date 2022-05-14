import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { apiService } from '@server/services/apiService';


export default {
  getLocationByIp: async (req, res: AppResponse<any>, next) => {
    try {
      const { ip } = req.query;
      const location = await apiService().getLocationByIp(ip);

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(location));
    } catch (e) {
      return next(e)
    }
  },
};
