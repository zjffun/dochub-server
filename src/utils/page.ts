import { IPageInfo } from 'src/types';

export function getPageInfo(page, pageSize): IPageInfo {
  let _page = Number(page);
  let _pageSize = Number(pageSize);

  if (!_page || _page < 1) {
    _page = 1;
  }

  if (!_pageSize || _pageSize < 1) {
    _pageSize = 1;
  }

  return {
    page: _page,
    pageSize: _pageSize,
    skip: (_page - 1) * _pageSize,
    limit: _pageSize,
  };
}
