import { t } from "i18next";

import { ComplianceLogItem, Status } from "../../../../../../shared/types/common";
import { isLegalEntity, isNaturalPerson } from "../../../../../../shared/types/investor";
import { ComplexIssuer } from "../../../../../../shared/types/issuer";
import { isInterestProduct, Product } from "../../../../../../shared/types/product";
import { Transaction } from "../../../../../../shared/types/transaction";

import {
  formatDate,
  getProductTotalAmount,
  getTransactionTotalPrice,
  getTransactionType,
  getUrlComplianceLog,
  toCamelCase
} from "../../../../utils";

import { DateUtils } from "../../../components/UI/DatePicker/datepicker.utils";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row, TableCell, TableCellTypes } from "../../../components/UI/Table";
import { getColorForColoredString } from "../../../components/UI/Table/table.constants";

type IssuerSummary = {
  totalProducts: number;
  totalVolume: number;
  totalInvestors: number;
  totalPayOut: number;
};

export const limitComplianceLog = 10;

const tPath = 'components.table';

export const createIssuerDetails = (issuer: Partial<ComplexIssuer>): ListItemProps[] => [
  {
    title: t('pages.issuer.view.details.list.status'),
    content: issuer.status,
    status: issuer.status as unknown as Status,
    isStatus: true
  },
  {
    title: t('pages.issuer.view.details.list.createdOn'),
    content: formatDate(new Date(issuer?.createdAt!).toISOString())
  },
  {
    title: t('pages.issuer.view.details.list.issuerName'),
    content: issuer.name
  },
  {
    title: t('pages.issuer.view.details.list.email'),
    content: issuer.email
  },
  {
    title: t('pages.issuer.view.details.list.phoneNumber'),
    content: issuer?.phone
  },
  {
    title: t('pages.issuer.view.details.list.kvk'),
    content: issuer?.kvk
  },
  {
    title: t('pages.issuer.view.details.list.vat'),
    content: issuer?.vat
  },
  {
    title: t('pages.issuer.view.details.list.address'),
    content: issuer?.address
  },
  {
    title: t('pages.issuer.view.details.list.postcode'),
    content: issuer?.postcode
  },
  {
    title: t('pages.issuer.view.details.list.city'),
    content: issuer?.city
  }
];


export const createIssuerSummary = ({ totalProducts, totalVolume, totalInvestors, totalPayOut }: IssuerSummary): ListItemProps[] => [
  {
    title: t('pages.issuer.view.summary.list.totalProducts'),
    content: totalProducts.toString(),
    contentClasses: 'list-item__montserrat'
  },
  {
    title: t('pages.issuer.view.summary.list.totalVolume'),
    content: totalVolume.toString(),
    isAmount: true,
  },
  {
    title: t('pages.issuer.view.summary.list.totalInvestors'),
    content: totalInvestors.toString(),
    contentClasses: 'list-item__montserrat'
  },
  {
    title: t('pages.issuer.view.summary.list.totalPayOut'),
    content: totalPayOut.toString(),
    isAmount: true
  }
];

export const createIssuerProductsRows = (products: Product[]): Row[] => {
  return products.map((product: Product) => {
    const maturityDate = isInterestProduct(product) ? DateUtils.addDeltaToDate(new Date(product.createdAt!), {
      ...DateUtils.defaultDelta,
      [product.maturityUnit as string]: product.maturity
    }, true) : null;

    const maturity = {
      type: TableCellTypes.STRING,
      value: maturityDate
        ? formatDate(maturityDate.toISOString())
        : "N/A",
    };

    return [
      {
        type: TableCellTypes.LINK,
        value: product.name,
        onClick: `/products/${product.id}`,
      },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.products.category.${product.category.toLowerCase()}`)
      },
      { type: TableCellTypes.CURRENCY, value: getProductTotalAmount(product) },
      { type: TableCellTypes.STRING, value: product.paymentType },
      {
        type: TableCellTypes.STRING,
        value: isInterestProduct(product) ? `${product.couponRate} %` : "N/A",
      },
      maturity,
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(product.status || Status.processing).toLowerCase()}`
        ),
        status: product.status || Status.processing,
      }
    ] as TableCell[];
  });
};

export const createIssuerTransactionsRows = (transactions: Transaction[]): Row[] => {
  return transactions.map(transaction => {
    const { createdAt, investor, product } = transaction;

    let investorName = '';
    if (isNaturalPerson(investor)) investorName = `${investor.firstName} ${investor.lastName}`;
    if (isLegalEntity(investor)) investorName = investor.companyName;

    const transactionType = getTransactionType(transaction);

    return [
      {
        type: TableCellTypes.DATE,
        value: createdAt ? formatDate(createdAt) : 'N/A'
      },
      {
        type: TableCellTypes.COLORED_STRING,
        value: t(`${tPath}.transactions.type.${transactionType.toLowerCase()}`),
        color: getColorForColoredString(transactionType)
      },
      {
        type: TableCellTypes.LINK,
        value: investorName,
        onClick: `/investor/${investor.id}`
      },
      {
        type: TableCellTypes.LINK,
        value: product.name,
        onClick: `/products/${product.id}`
      },
      {
        type: TableCellTypes.CURRENCY,
        value: getTransactionTotalPrice(transaction).toString()
      },
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(transaction.status || Status.processing).toLowerCase()}`
        ),
        status: transaction.status || Status.processing,
      }
    ] as TableCell[];
  });
};

export const createComplianceLogRows = (userId: string, data: ComplianceLogItem[]): Row[] => {
  if (!data) return [];

  return data.map((item: ComplianceLogItem) => [
    {
      type: TableCellTypes.DATE,
      value: formatDate(item.date),
    },
    {
      type: TableCellTypes.STRING_WITH_LINK,
      value: "",
      stringWithLinkData: [
        {
          type: TableCellTypes.STRING,
          value: t(`${tPath}.complianceLog.action.${toCamelCase(item.action.name)}`),
        },
        {
          type: TableCellTypes.LINK,
          value: item.action.entityName,
          onClick: getUrlComplianceLog(item),
        },
      ],
    },
    {
      type: TableCellTypes.STRING,
      value: item.remarks || "",
    },
    {
      type: TableCellTypes.DECISION,
      value: item.id || "",
      status: item.status,
      decision: {
        status: item.status,
        value: t(`${tPath}.complianceLog.status.${item.status.toLowerCase()}`),
      },
    },
  ]);
};

export const productTableHeader = [
  'pages.issuer.view.products.table.head.product',
  'pages.issuer.view.products.table.head.category',
  'pages.issuer.view.products.table.head.avialableVolume',
  'pages.issuer.view.products.table.head.paymentType',
  'pages.issuer.view.products.table.head.couponRate',
  'pages.issuer.view.products.table.head.maturity',
  'pages.issuer.view.products.table.head.status'
];

export const transactionsTableHeader = [
  'pages.issuer.view.transactions.table.head.date',
  'pages.issuer.view.transactions.table.head.type',
  'pages.issuer.view.transactions.table.head.investor',
  'pages.issuer.view.transactions.table.head.product',
  'pages.issuer.view.transactions.table.head.amount',
  'pages.issuer.view.transactions.table.head.status'
];

export const complianceLogTHeader = [
  'pages.admin.overview.complianceLog.table.head.date',
  'pages.admin.overview.complianceLog.table.head.action',
  'pages.admin.overview.complianceLog.table.head.remarks',
  'pages.admin.overview.complianceLog.table.head.status',
];

