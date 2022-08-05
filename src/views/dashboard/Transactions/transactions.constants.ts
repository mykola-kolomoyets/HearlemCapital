import { Roles, Status } from '../../../../../shared/types/common';
import { isNaturalPerson } from '../../../../../shared/types/investor';
import { CreateTransactonResponse, TransactionType } from '../../../../../shared/types/transaction';
import { formatDate, getTransactionTotalPrice, getTransactionType } from '../../../utils';
import { Row, TableCellTypes, TableCell } from '../../components/UI/Table';
import { getColorForColoredString, MAX_VALUE_LENGTH } from '../../components/UI/Table/table.constants';
import {  TransactionStatus } from "../../../../../shared/types/transaction";
import { t } from 'i18next';

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate = [
  Roles.admin
];

export const centeredColumns = {
  investor: [3],
  admin: [4],
  issuer: [3],
  compliance: [4]
};

const tableHeads = {
  investor: [
    'pages.transactions.table.head.date',
    'pages.transactions.table.head.type',
    'pages.transactions.table.head.product',
    'pages.transactions.table.head.amount',
    'pages.transactions.table.head.status'
  ],
  admin: [
    'pages.transactions.table.head.date',
    'pages.transactions.table.head.type',
    'pages.transactions.table.head.investor',
    'pages.transactions.table.head.product',
    'pages.transactions.table.head.amount',
    'pages.transactions.table.head.status'
  ],
  issuer: [
    'pages.transactions.table.head.date',
    'pages.transactions.table.head.type',
    'pages.transactions.table.head.product',
    'pages.transactions.table.head.amount',
    'pages.transactions.table.head.status'
  ],
  compliance: [
    'pages.transactions.table.head.date',
    'pages.transactions.table.head.type',
    'pages.transactions.table.head.investor',
    'pages.transactions.table.head.product',
    'pages.transactions.table.head.amount',
    'pages.transactions.table.head.status'
  ]
};

export const theadData = (role: Roles = Roles.investor) => tableHeads[role];

export enum TransactionColor {
  DEFAULT = 'default',
  PAYMENT = 'gray',
  BUY = 'green',
  SELL = 'red'
}

export const transactionTypes = [
  {
    value: TransactionType.BUY,
    label: `${tPath}.transactions.type.buy`
  },
  {
    value: TransactionType.SELL,
    label: `${tPath}.transactions.type.sell`
  },
  {
    value: TransactionType.PAYMENT,
    label: `${tPath}.transactions.type.payment`
  }
];

export const createTransactionsRows = (data: CreateTransactonResponse[], role: Roles = Roles.investor): Row[] => {
  return data.map((x: CreateTransactonResponse) => {
    const date = x.createdAt ? formatDate(x.createdAt!) : 'N/A';

    const investorColumnType = role === Roles.admin ? TableCellTypes.LINK : TableCellTypes.STRING;
    const investorColumnValue = isNaturalPerson(x.investor) ?
      `${x.investor.firstName} ${x.investor.lastName}` :
      x.investor?.companyName;

    const investorColumnOnClick = role === Roles.admin ? { onClick: `/investor/${x.investor.id}` } : {};

    const investorName = {
      type: investorColumnType,
      value: investorColumnValue,
      ...investorColumnOnClick
    };

    const transactionDate = {
      type: TableCellTypes.DATE,
      value: date
    };

    const transactionType = getTransactionType(x);
    const type = {
      type: TableCellTypes.COLORED_STRING,
      value: t(`${tPath}.transactions.type.${transactionType.toLowerCase()}`),
      color: getColorForColoredString(transactionType)
    };

    const productName = x.product.name;
    const withTooltip = productName.length > MAX_VALUE_LENGTH;

    const product = {
      type: TableCellTypes.LINK,
      value: productName,
      onClick: `/products/${x.product.id}`,
      withTooltip
    };

    const amount = {
      type: TableCellTypes.CURRENCY,
      value: getTransactionTotalPrice(x).toString()
    };

    const status = {
      type: TableCellTypes.STATUS,
      value: t(
        `${tPath}.status.${(x.status || Status.processing).toLowerCase()}`
      ),
      status: x.status || Status.processing,
    };

    const tableRows = {
      investor: [
        transactionDate,
        type,
        product,
        amount,
        status
      ],
      admin: [
        transactionDate,
        type,
        investorName,
        product,
        amount,
        status
      ],
      issuer: [
        transactionDate,
        type,
        product,
        amount,
        status
      ],
      compliance: [
        transactionDate,
        type,
        investorName,
        product,
        amount,
        status
      ],
    };

    return tableRows[role] as TableCell[];
  });
};

type TypeMappingTransactionsCategory = {
  [key in TransactionStatus]: string;
} & { [all:string]: string };


export const MappingTransactionCategory: TypeMappingTransactionsCategory = {
  Processing: "pages.transactions.transactionsCategory.processing",
  Processed: "pages.transactions.transactionsCategory.processed",
  Failed: "pages.transactions.transactionsCategory.failed",
  Rejected: "pages.transactions.transactionsCategory.rejected",
  all: "pages.transactions.transactionsCategory.all"
};
