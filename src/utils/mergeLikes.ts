import { LikesPivotModel, LikesType } from '@server/models/likesPivot.model';

export type WithLikes<T> = T & {
  likes: {
    count: number;
    isLiked: boolean; // Лайкнул ли текущий пользовать эту модель
  };
};

type Options = {
  type: LikesType;
  currentUserId?: string;
};

export const mergeLikes = async <T extends { _id?: string }>(
  target: T,
  { type, currentUserId }: Options,
): Promise<WithLikes<T>> => {
  const countLikes = await LikesPivotModel.count({ type, target: target._id });
  let isLiked = false;

  if (currentUserId) {
    isLiked = !!(await LikesPivotModel.findOne({ type, target: target._id, user: currentUserId }));
  }

  return {
    ...target,
    likes: {
      count: countLikes,
      isLiked,
    },
  };
};
