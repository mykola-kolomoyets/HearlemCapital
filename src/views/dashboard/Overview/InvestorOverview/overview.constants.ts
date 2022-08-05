import { t } from "i18next";
import { InvestorChartData, InvestorIntervalChartData } from "../../../../../../shared/types/investor";
import { Issuer } from "../../../../../../shared/types/issuer";
import { Transaction, TransactionStatus } from "../../../../../../shared/types/transaction";
import {
  Product,
  isInterestProduct,
} from "../../../../../../shared/types/product";

import { formatDate, getTransactionTotalPrice, getTransactionType } from "../../../../utils";

import { Row, TableCellTypes, TableCell } from "../../../components/UI/Table";
import { getColorForColoredString } from "../../../components/UI/Table/table.constants";
import { DateUtils } from "../../../components/UI/DatePicker/datepicker.utils";
import { Locales } from "../../../../localization/models";

export const defaultChartPeriodRange = [
  DateUtils.addDeltaToDate(new Date, { days: 7, months: 0, years: 0 }, false).toDateString(),
  new Date().toDateString()
];

export const createProductRows = (data: Product[]): Row[] => {
  return data.map((product: Product) => [
    {
      type: TableCellTypes.LINK,
      value: product.name,
      onClick: `/products/${product.id}`,
    },
    {
      type: TableCellTypes.STRING,
      value: (product.issuer as Pick<Issuer, 'id' | 'name'>).name
    },
    { 
      type: TableCellTypes.STRING,
       value: t(`pages.overview.products.table.content.categoryType.${(product.category).toLowerCase()}`), 
    },
    {
      type: TableCellTypes.CURRENCY,
      value: product.availableVolume! * product.ticketSize!
    },
    {
      type: TableCellTypes.STRING,
      value: isInterestProduct(product) ? `${product.couponRate} %` : "N/A",
    },
    {
      type: TableCellTypes.STRING,
      value: isInterestProduct(product)
        ? `${product.maturity} ${product.maturityUnit}`
        : "N/A",
    },
  ] as TableCell[]);
};

export const createTransactionRows = (data: Transaction[], id: string): Row[] => {
  return data.map((transaction: Transaction) => {
    const transactionType = getTransactionType(transaction, id);

    return [
    {
      type: TableCellTypes.DATE,
      value: formatDate(transaction.createdAt),
    },
    {
      type: TableCellTypes.COLORED_STRING,
      value: t(`pages.overview.transactions.table.content.type.${(transactionType).toLowerCase()}`),
      color: getColorForColoredString(transactionType),
    },
    {
      type: TableCellTypes.LINK,
      value: transaction.product.name,
      onClick: `/products/${transaction.product.id}`,
    },
    {
      type: TableCellTypes.CURRENCY,
      value: getTransactionTotalPrice(transaction).toString()
    },
    {
      type: TableCellTypes.STATUS,
      value: t(`pages.overview.transactions.table.content.status.${(transaction.status || TransactionStatus.processing).toLowerCase()}`),
      status: (transaction.status || TransactionStatus.processing),
    },
  ] as TableCell[];
});
};

export const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 1.0,
};

export const tooltipLabels = [
  "pages.overview.chart.tooltip.totalAmount",
  "pages.overview.chart.tooltip.originalAmount",
];

export const topProductsTHeader = [
  "pages.overview.products.table.header.product",
  "pages.overview.products.table.header.issuer",
  "pages.overview.products.table.header.category",
  "pages.overview.products.table.header.avialableVolume",
  "pages.overview.products.table.header.couponRate",
  "pages.overview.products.table.header.maturity",
];

export const lastTransactionsTHeader = [
  "pages.overview.transactions.table.header.date",
  "pages.overview.transactions.table.header.type",
  "pages.overview.transactions.table.header.product",
  "pages.overview.transactions.table.header.amount",
  "pages.overview.transactions.table.header.status",
];

export const months = {
  [Locales.en]: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  [Locales.nl]: ["Jan", "Feb", "Maart", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
};

export const mockChartData: InvestorChartData[] = [
  {
    period: 0,
    totalOriginalAmount: 123400,
    totalAmountReceived: 1000
  },
  {
    period: 1,
    totalOriginalAmount: 145400,
    totalAmountReceived: 2000
  },
  {
    period: 2,
    totalOriginalAmount: 223400,
    totalAmountReceived: 3000
  },
  {
    period: 3,
    totalOriginalAmount: 323890,
    totalAmountReceived: 4000
  },
  {
    period: 4,
    totalOriginalAmount: 143400,
    totalAmountReceived: 5000
  },
  {
    period: 5,
    totalOriginalAmount: 4500,
    totalAmountReceived: 6000
  },
];

export const recievedAmountDataSet = (data: number[]) => ({
  fill: true,
  lineTension: 0.2,
  borderColor: "#0099CC",
  borderWidth: 2,
  pointBorderColor: "#0099CC",
  pointBackgroundColor: "#ffffff",
  pointBorderWidth: 2,
  backgroundColor: "rgba(0, 153, 204, 0.08)",
  data,
  stepped: true,
});

export const getAmountsArray = (data: InvestorChartData[] | InvestorIntervalChartData[], field: 'totalOriginalAmount' | 'totalAmountReceived'): number[] => {
  return data
  .map(item => item[field])
  .reduce((acc, curr, index) => [ ...acc, (curr + (index > 0 ? acc[index - 1] : 0))], [] as number[]);
};

const isPeriodChartData = (data: InvestorChartData[] | InvestorIntervalChartData[]): data is InvestorIntervalChartData[] => Boolean((data as InvestorIntervalChartData[])[0]?.date);
const isYearToDateChartData = (data: InvestorChartData[] | InvestorIntervalChartData[]): data is InvestorChartData[] => (data as InvestorChartData[])[0]?.period >= 0;

export const createChartDataset = (data: InvestorChartData[] | InvestorIntervalChartData[], TORs: number[], TOAs: number[], locale: Locales) => {
  const datasets = TORs.map((tor, index) => tor + TOAs[index]);

  let labels = [] as string[];

  if (isYearToDateChartData(data)) labels = data.map(item => `${months[locale][item.period]} ${new Date().getFullYear()}`);
  if (isPeriodChartData(data)) labels = data.map(item => item.date.split('-').reverse().join('-'));

  return ({
    labels,
    datasets: [
      recievedAmountDataSet(datasets),
    ],
  });
};