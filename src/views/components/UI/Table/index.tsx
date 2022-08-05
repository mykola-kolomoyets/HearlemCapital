import classNames from "classnames";

import TableRow from "./TableRow";
import TableHeadItem from "./TableHeadItem";
import { Heading } from "../Heading";

import { TextColors } from "./table.constants";
import "./table.scss";
import { AccountStatus, ApproveOptions, CellStatus, ComplianceStatus, Status } from "../../../../../../shared/types/common";
import { SortingDirection, useSortedTable } from "./Table.utils";
import { useEffect, useState } from "react";
import { TransactionStatus } from "../../../../../../shared/types/transaction";

export type TableProps = {
  theadData: string[];
  tbodyData: Row[];
  className?: string;
  emptyState?: string;
  sortedFields?: {
    indexes: number[]
  },
  centeredColumns?: number[];
  multiSortFields?: number[];
  approveOptions?: ApproveOptions;
};

export type TableCell = {
  type: TableCellTypes;
  isCentered?: boolean;
  value: string;
  title?: string;
  onClick?: string;
  status?: AccountStatus | CellStatus | ComplianceStatus | TransactionStatus | Status;
  contentClasses?: string;
  color?: TextColors;
  withTooltip?: boolean;
  decision?: {
    value: string;
    status: ComplianceStatus,
  }
  stringWithLinkData?: {
    type: string;
    value: string;
    onClick?: string
  }[];
  tooltip?: JSX.Element;
  approveOptions?: ApproveOptions
};

export type Row = TableCell[];

export enum TableCellTypes {
  STRING = "string",
  DATE = "date",
  STATUS = "status",
  LINK = "link",
  PERCENT = "percent",
  CURRENCY = "currency",
  COLORED_STRING = "coloredString",
  STRING_WITH_LINK = "stringWithLink",
  DECISION = "decision"
}

const Table = ({
  theadData,
  tbodyData,
  className,
  emptyState,
  sortedFields,
  centeredColumns,
  multiSortFields,
  approveOptions
}: TableProps) => {
  const [defaultRows, setDefaultRows] = useState<Row[]>(tbodyData);
  const [rows, setRows] = useState<Row[]>(tbodyData);
  const [isSorting, setIsSorting] = useState(false);

  const sortingConfig = sortedFields ? {
    index: sortedFields.indexes[0],
    direction: SortingDirection.default
  } : null;

  const { items, requestSort, sortConfig } = useSortedTable(tbodyData, sortingConfig);

  const isSortedColumn = (index: number) =>
    multiSortFields
      ? multiSortFields.includes(index)
      : sortConfig?.index === index;


  const getColumnClassName = (name: string, index: number): string => {
    let resultClasses = '';

    if (sortConfig) {
      if (theadData[sortConfig.index].toLowerCase() === name.toLowerCase()) {
        resultClasses = classNames(isSorting ? sortConfig.direction : SortingDirection.default);
      }
    }

    if (centeredColumns) {
      resultClasses = classNames(resultClasses, {
        'table__column--centered': centeredColumns.includes(index)
      });
    }

    return resultClasses;
  };

  const onRequestSort = (index: number) => {
    setIsSorting(true);
    requestSort(index);
  };

  const createRows = (data: Row[]): (JSX.Element | undefined)[] => {
    if (!data) return [];
    return data?.map((row, index) => {
      if (row && row?.length) return (
        <TableRow
          key={Object.keys(row)[0] + index}
          items={row}
          centeredColumns={centeredColumns}
          approveOptions={approveOptions}
        />);
    });
  };

  useEffect(() => {
    if (isSorting && sortConfig?.direction === SortingDirection.default) setRows(tbodyData);
    else {
      const currentRows: Row[] = isSorting && sortConfig && items ? items : tbodyData;
      setRows(currentRows);
    }
  }, [items, tbodyData, sortConfig, isSorting]);

  useEffect(() => {
    if (tbodyData) setDefaultRows(tbodyData);
  }, [tbodyData]);

  return (
    !rows?.length && emptyState ? (
      <div>
        <Heading view="accent" active>
          {emptyState}
        </Heading>
      </div>
    ) : (
      <div className="table-wrapper">
        <table className={classNames("table", className)} cellSpacing="0">
          <thead>
            <tr>
              {theadData.map((item, index) => (
                <TableHeadItem
                  key={item + index}
                  className={getColumnClassName(item, index)}
                  item={item}
                  {...(isSortedColumn(index) ? { onClick: () => onRequestSort(index) } : {})}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {createRows(sortConfig?.direction === SortingDirection.default ? defaultRows : rows)}
          </tbody>
        </table>
      </div>
    )
  );
};

export default Table;
