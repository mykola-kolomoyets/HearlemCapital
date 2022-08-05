import { t } from "i18next";

import { Holding } from "../../../../../shared/types/holding";
import { ProductCategory } from "../../../../../shared/types/product";

import { getProductTotalAmount, formatDate, getDecimalNumber, getOutstandingCapital } from "../../../utils";

import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";
import { TextColors } from "../../components/UI/Table/table.constants";

export const tHeader = [
  "pages.portfolio.table.head.holding",
  "pages.portfolio.table.head.category",
  "pages.portfolio.table.head.weight",
  "pages.portfolio.table.head.originalAmount",
  "pages.portfolio.table.head.outstandingAmount",
  "pages.portfolio.table.head.amountRecieved",
  "pages.portfolio.table.head.heldSince",
  "pages.portfolio.table.head.maturityDate",
  "pages.portfolio.table.head.nonCallPeriod",
];

export const tooltipLabels = [
  "pages.overview.chart.tooltip.totalAmount",
  "pages.overview.chart.tooltip.originalAmount",
];

export const getAnnullizedYield = (toa: number, tar: number) =>
  toa > 0 ? getDecimalNumber((Math.pow((toa + tar) / toa, 1) - 1) * 100) : 0;

export const createHoldingsRows = (holdings: Holding[], toa: number): Row[] => {
  const holdingsWeights = holdings.map(holding => getDecimalNumber((getProductTotalAmount(holding) / toa)));

  return holdings.map((holding, index) => {
    const isOutStandingCapitalDisplayed = holding.category === ProductCategory.Bond;

    return [
      {
        type: TableCellTypes.LINK,
        value: holding.name,
        onClick: `/products/${holding.product}`,
      },
      {
        type: TableCellTypes.STRING,
        value: t(`pages.overview.products.table.content.categoryType.${(holding.category || "Certificate").toLowerCase()}`),
      },
      {
        type: TableCellTypes.STRING,
        value:
          holdingsWeights[index] >= 0.01
            ? `${holdingsWeights[index]}`
            : "< 0.01",
      },
      {
        type: TableCellTypes.CURRENCY,
        value: (getProductTotalAmount(holding)).toString(),
        color: TextColors.black,
      },
      {
        type: isOutStandingCapitalDisplayed ? TableCellTypes.CURRENCY : TableCellTypes.STRING,
        value: isOutStandingCapitalDisplayed ? getOutstandingCapital(holding).toString() : 'N/A',
        color: TextColors.black,
        contentClasses: 'table-cell__centered'
      },
      {
        type: TableCellTypes.CURRENCY,
        value: holding?.amountReceived?.toString() || "0",
        color:
          Number(holding.amountReceived) > 0
            ? TextColors.green
            : TextColors.black,
      },
      {
        type: TableCellTypes.DATE,
        value: holding.heldSince ? formatDate(holding.heldSince) : "N/A",
      },
      {
        type: TableCellTypes.DATE,
        value: holding.maturityDate ? formatDate(holding.maturityDate) : "N/A",
      },
      {
        type: TableCellTypes.DATE,
        value: holding.nonCallPeriod ? formatDate(holding.nonCallPeriod) : "N/A",
      },
    ] as TableCell[];
  });
};

export const colors = [
  '#0099CC',
  '#a55eea',
  '#eb3b5a',
  '#fd9644',
  '#fed330',
  '#20bf6b',
  '#26de81',
  '#0fb9b1',
  '#4b6584',
  '#a5b1c2',
];
