import dayjs from 'dayjs';
import vars from '@config/vars';
import { RefreshTokenModel, RefreshTokenGenerateUser } from '@server/models/refreshToken.model';

export async function generateTokenResponse(user: RefreshTokenGenerateUser, accessToken: string) {
  const tokenType = 'Bearer';
  const refreshToken = (await RefreshTokenModel.generate(user)).token;
  const expiresIn = dayjs()
    .add(+vars.jwtExpirationInterval, 'minutes')
    .unix();

  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

export type GenerateTokenResponse<T = ReturnType<typeof generateTokenResponse>> = T extends Promise<infer R> ? R : T;
