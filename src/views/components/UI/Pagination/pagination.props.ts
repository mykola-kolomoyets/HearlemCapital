export type PaginationProps = {
  from: number;
  to: number;
  total: number;
  delta: number;
  showNext?: () => void;
  showPrev?: () => void;
  disabledPrev?: boolean;
  disabledNext?: boolean;
};
