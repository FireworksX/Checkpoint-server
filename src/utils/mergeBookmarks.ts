import { BookmarksPivotModel, BookmarksType } from '@server/models/bookmarksPivot.model';

export type WithBookmarks<T> = T & {
  bookmarks: {
    hasBookmark: boolean; // Добавил ли текущий пользовать эту модель
  };
};

type Options = {
  type: BookmarksType;
  currentUserId: string;
};

export const mergeBookmarks = async <T extends { _id?: string }>(
  target: T,
  { type, currentUserId }: Options,
): Promise<WithBookmarks<T>> => {
  const hasBookmark = !!(await BookmarksPivotModel.findOne({ type, target: target._id, user: currentUserId }));

  return {
    ...target,
    bookmarks: {
      hasBookmark,
    },
  };
};
