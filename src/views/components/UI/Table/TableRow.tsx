import TableCellView from "./TableCell";

import { Row } from "./";
import { ApproveOptions } from "../../../../../../shared/types/common";

export type TableRowProps = {
  items: Row;
  approveOptions?: ApproveOptions;
  centeredColumns?: number[];
};

const TableRow = ({ items, approveOptions, centeredColumns }: TableRowProps) => (
  <tr>
    { items.map((item, index) => (
      <TableCellView
        isCentered={centeredColumns && centeredColumns.includes(index)}
        key={item.type + index}
        approveOptions={approveOptions}
        {...item}
      />
    ))}
  </tr>
);

export default TableRow;
