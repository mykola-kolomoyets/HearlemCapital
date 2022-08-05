import { t } from "i18next";
import { Status } from "../../../../../../shared/types/common";
import {
  Investor,
  isLegalEntity,
  isNaturalPerson,
} from "../../../../../../shared/types/investor";
import { Issuer } from "../../../../../../shared/types/issuer";
import {
  Product,
  isInterestProduct,
} from "../../../../../../shared/types/product";
import { Transaction } from "../../../../../../shared/types/transaction";

import {
  formatDate,
  getProductTotalAmount,
  getTransactionTotalPrice,
  getTransactionType,
  toCamelCase,
} from "../../../../utils";
import { DateUtils } from "../../../components/UI/DatePicker/datepicker.utils";

import { Row, TableCellTypes, TableCell } from "../../../components/UI/Table";
import {
  getColorForColoredString,
  MAX_VALUE_LENGTH,
} from "../../../components/UI/Table/table.constants";

const tPath = "components.table";

export const createProductRows = (data: Product[]): Row[] => {
  return data.map((product: Product) => {
    const maturityDate = isInterestProduct(product)
      ? DateUtils.addDeltaToDate(
          new Date(product.listingDate!),
          {
            ...DateUtils.defaultDelta,
            [product.maturityUnit as string]: product.maturity,
          },
          true
        )
      : null;

    const maturity = {
      type: TableCellTypes.STRING,
      value: maturityDate ? formatDate(maturityDate.toISOString()) : "N/A",
    };

    const productName = product.name;
    const issuerName = (product.issuer as Pick<Issuer, "id" | "name">).name;

    const isProductNamewithTooltip = productName.length > MAX_VALUE_LENGTH;
    const isIssuerNamewithTooltip = issuerName.length > MAX_VALUE_LENGTH;

    return [
      {
        type: TableCellTypes.LINK,
        value: productName,
        withTooltip: isProductNamewithTooltip,
        onClick: `/products/${product.id}`,
      },
      {
        type: TableCellTypes.LINK,
        value: issuerName,
        withTooltip: isIssuerNamewithTooltip,
        onClick: `/issuer/${
          (product.issuer as Pick<Issuer, "id" | "name">).id
        }`,
      },
      {
        type: TableCellTypes.STRING,
        value: t(
          `${tPath}.products.category.${product.category.toLowerCase()}`
        ),
      },
      { type: TableCellTypes.CURRENCY, value: getProductTotalAmount(product) },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.products.type.${product.paymentType.toLowerCase()}`),
      },
      {
        type: TableCellTypes.STRING,
        value: isInterestProduct(product) ? `${product.couponRate} %` : "N/A",
      },
      maturity,
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(
            product.status || Status.processing
          ).toLowerCase()}`
        ),
        status: product.status || Status.processing,
      },
    ] as TableCell[];
  });
};

export const createTransactionRows = (data: Transaction[]): Row[] => {
  return data.map((transaction: Transaction) => {
    const { product, createdAt, investor, status } = transaction;

    const withTooltip = product.name.length > MAX_VALUE_LENGTH;

    let investorName = "";
    if (isNaturalPerson(investor))
      investorName = `${investor.firstName} ${investor.lastName}`;
    if (isLegalEntity(investor)) investorName = investor.companyName;

    const transactionType = getTransactionType(transaction);
    return [
      {
        type: TableCellTypes.DATE,
        value: formatDate(createdAt),
      },
      {
        type: TableCellTypes.LINK,
        value: investorName,
        onClick: `/investor/${investor.id}`,
      },
      {
        type: TableCellTypes.COLORED_STRING,
        value: t(`${tPath}.transactions.type.${transactionType.toLowerCase()}`),
        color: getColorForColoredString(transactionType),
      },
      {
        type: TableCellTypes.LINK,
        value: product.name,
        onClick: `/products/${product.id}`,
        withTooltip,
      },
      {
        type: TableCellTypes.CURRENCY,
        value: getTransactionTotalPrice(transaction),
      },
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(status || Status.processing).toLowerCase()}`
        ),
        status: status || Status.processing,
      },
    ] as TableCell[];
  });
};

export const createInvestorsRows = (data: Investor[]): Row[] => {
  return data.map(
    (investor: Investor) =>
      [
        {
          type: TableCellTypes.DATE,
          value: formatDate(investor?.createdAt!),
        },
        {
          type: TableCellTypes.LINK,
          value: isNaturalPerson(investor)
            ? `${investor?.firstName} ${investor?.lastName}`
            : investor?.companyName,
          onClick: `/investor/${investor.id}`,
        },
        {
          type: TableCellTypes.STRING,
          value: t(`${tPath}.investors.type.${toCamelCase(investor.type)}`),
        },
        { type: TableCellTypes.STRING, value: investor.email },
        {
          type: TableCellTypes.STATUS,
          value: t(
            `${tPath}.status.${(
              investor.status || Status.processing
            ).toLowerCase()}`
          ),
          status: investor.status || Status.processing,
        },
      ] as TableCell[]
  );
};

export const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 1.0,
};

export const pendingInvestorsTHeader = [
  "pages.admin.overview.pendingInvestors.table.head.date",
  "pages.admin.overview.pendingInvestors.table.head.investor",
  "pages.admin.overview.pendingInvestors.table.head.type",
  "pages.admin.overview.pendingInvestors.table.head.email",
  "pages.admin.overview.pendingInvestors.table.head.status",
];

export const pendingProductsTHeader = [
  "pages.admin.overview.pendingProducts.table.head.product",
  "pages.admin.overview.pendingProducts.table.head.issuer",
  "pages.admin.overview.pendingProducts.table.head.category",
  "pages.admin.overview.pendingProducts.table.head.totalVolume",
  "pages.admin.overview.pendingProducts.table.head.paymentType",
  "pages.admin.overview.pendingProducts.table.head.couponRate",
  "pages.admin.overview.pendingProducts.table.head.maturity",
  "pages.admin.overview.pendingProducts.table.head.status",
];

export const pendingTransactionsTHeader = [
  "pages.admin.overview.pendingTransactions.table.head.date",
  "pages.admin.overview.pendingTransactions.table.head.investor",
  "pages.admin.overview.pendingTransactions.table.head.type",
  "pages.admin.overview.pendingTransactions.table.head.product",
  "pages.admin.overview.pendingTransactions.table.head.amount",
  "pages.admin.overview.pendingTransactions.table.head.status",
];

const chartLabels = [
  "buyVolume",
  "sellVolume",
  "paymentVolume",
  "processingVolume",
  "totalVolume",
];

export const tooltipLabels = chartLabels.map(
  (label) => `pages.admin.overview.chart.tooltip.${label}`
);

export const platformOverviewLabels = [
  "pages.admin.overview.platformOverview.volume",
  "pages.admin.overview.platformOverview.deposits",
  "pages.admin.overview.platformOverview.transactions",
];

const colors = ["#28A745", "#CC3300", "#0099CC", "#ffd60a", "#DCDCDC"];

export const transactionVolumeLabelData = chartLabels.map((label, index) => ({
  item: {
    data: { label: `pages.admin.overview.chart.tooltip.${label}` },
  },
  additionalStyle: { labelColor: colors[index] },
}));

export const createChartData = (rowLabels: string[], data: number[][]) =>
  rowLabels.map((item, index) => ({
    label: item,
    data: data[index],
    backgroundColor: colors[index],
  }));
