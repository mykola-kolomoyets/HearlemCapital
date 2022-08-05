import { t } from "i18next";
import { AccountStatus, Roles, Status } from "../../../../../shared/types/common";
import { Investor, isNaturalPerson } from "../../../../../shared/types/investor";

import { formatDate, toCamelCase } from "../../../utils";

import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate  = [ Roles.admin ];

export type InvestorsCategories = {
  [key in AccountStatus]: number;
} & { all: number };

export const initialCategories = Object.keys(AccountStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [curr]: 0 }), {}) as InvestorsCategories;

export const theadData = [
  'pages.investors.table.head.date',
  'pages.investors.table.head.entityType',
  'pages.investors.table.head.name',
  'pages.investors.table.head.email',
  'pages.investors.table.head.totalPayments',
  'pages.investors.table.head.totalProducts',
  'pages.investors.table.head.status'
];

export const createInvestorsRows = (data: Investor[]): Row[] | [] => {
  return data.map((investor: Investor) => {
    const name =  {
      type: TableCellTypes.LINK,
      value: isNaturalPerson(investor) ? `${investor.firstName} ${investor.lastName}` : investor.companyName,
      onClick: `/investor/${investor.id}`
    };

    return [
      { type: TableCellTypes.DATE, value: formatDate(investor?.createdAt!) },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.investors.type.${toCamelCase(investor.type)}`)
      },
      name,
      { type: TableCellTypes.STRING, value: investor.email },
      { type: TableCellTypes.CURRENCY, value: investor.totalPayments?.toString() },
      { type: TableCellTypes.STRING, value: investor.totalProducts?.toString() },
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(investor.status || Status.processing).toLowerCase()}`
        ),
        status: investor.status || Status.processing,
      },
    ] as TableCell[];
  });
};
