import { t } from "i18next";
import { Product, isInterestProduct } from "../../../../../../shared/types/product";
import { Transaction, TransactionStatus } from "../../../../../../shared/types/transaction";

import { formatDate, getProductTotalAmount, getTransactionTotalPrice, getTransactionType } from "../../../../utils";

import { Row, TableCellTypes, TableCell } from "../../../components/UI/Table";
import { getColorForColoredString } from "../../../components/UI/Table/table.constants";

export const createProductRows = (data: Product[]): Row[] => {
  return data.map((product: Product) => [
    {
      type: TableCellTypes.LINK,
      value: product.name,
      onClick: `/products/${product.id}`
    },
    { 
      type: TableCellTypes.STRING,
       value: t(`pages.overview.products.table.content.categoryType.${(product.category).toLowerCase()}`), 
    },
    { type: TableCellTypes.CURRENCY, value: getProductTotalAmount(product) },
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
    {
      type: TableCellTypes.STATUS,
      value: t(`pages.overview.products.table.content.status.${(product?.status ?? 'inactive').toLowerCase()}`), 
       status: product.status
    }
  ] as TableCell[]);
};

export const createTransactionRows = (data: Transaction[]): Row[] => {
  return data.map((transaction: Transaction) => {
    const transactionType = getTransactionType(transaction);

    return [
      {
        type: TableCellTypes.DATE,
        value: formatDate(transaction.createdAt)
      },
      {
        type: TableCellTypes.COLORED_STRING,
        value: t(`pages.overview.transactions.table.content.type.${(transactionType).toLowerCase()}`),
        color: getColorForColoredString(transactionType)
      },
      {
        type: TableCellTypes.LINK,
        value: transaction.issuer.name
      },
      {
        type: TableCellTypes.LINK,
        value: transaction.product.name,
        onClick: `/products/${transaction.product.id}`
      },
      {
        type: TableCellTypes.CURRENCY,
        value: getTransactionTotalPrice(transaction).toString()
      },
      {
        type: TableCellTypes.STATUS,
        value: t(`pages.overview.transactions.table.content.status.${(transaction.status || TransactionStatus.processing).toLowerCase()}`),
        status: transaction.status || TransactionStatus.processing
      }
    ] as TableCell[];
  });
};

export const productsTHeader = [
  'pages.issuer.overview.myProducts.table.header.product',
  'pages.issuer.overview.myProducts.table.header.category',
  'pages.issuer.overview.myProducts.table.header.avialableVolume',
  'pages.issuer.overview.myProducts.table.header.couponRate',
  'pages.issuer.overview.myProducts.table.header.maturity',
  'pages.issuer.overview.myProducts.table.header.status'
];

export const transactionsTHeader = [
  'pages.issuer.overview.myProductsTransactions.table.header.date',
  'pages.issuer.overview.myProductsTransactions.table.header.type',
  'pages.issuer.overview.myProductsTransactions.table.header.investor',
  'pages.issuer.overview.myProductsTransactions.table.header.product',
  'pages.issuer.overview.myProductsTransactions.table.header.amount',
  'pages.issuer.overview.myProductsTransactions.table.header.status',
];