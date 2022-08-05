import { Fragment } from "react";
import { ArrowIcon } from "../../icons";

export type TableHeadItemProps = {
  item: string;
  className?: string;
  onClick?: () => void;
};


const TableHeadItem = ({ item, className, onClick }: TableHeadItemProps) => (
  <td className={className} title={item} onClick={onClick}>
    <div>
    <span>{item}</span>

    {className && className?.split(' ')?.length! > 1 && !className?.split(' ').includes('sort-default') && (
      <Fragment>
        &nbsp;
        <ArrowIcon width="16px" height="16px" rotate={className?.split(' ').includes('ascending') ? 0 : 180} fill={'green'}/>
      </Fragment>
        )}
    </div>
  </td>
);

export default TableHeadItem;
