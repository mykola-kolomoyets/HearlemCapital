import { t } from 'i18next';
import { Roles, Status } from '../../../../../shared/types/common';
import { Issuer } from '../../../../../shared/types/issuer';
import { formatDate } from '../../../utils';
import { Row, TableCellTypes, TableCell } from '../../components/UI/Table';

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate = [ Roles.admin ];

// pages.admin.issuers.table.head.
export const theadData = [
  'pages.admin.issuers.table.head.date',
  'pages.admin.issuers.table.head.name',
  'pages.admin.issuers.table.head.email',
  'pages.admin.issuers.table.head.totalProducts',
  'pages.admin.issuers.table.head.totalVolume',
  'pages.admin.issuers.table.head.status'
];

export enum TransactionColor {
  DEFAULT = 'default',
  PAYMENT = 'gray',
  BUY = 'green',
  SELL = 'red'
}

export const createIssuersRows = (issuers: Issuer[]): Row[] => {
  return issuers.map((issuer: Issuer) => {
    const date = {
      type: TableCellTypes.DATE,
      value: formatDate(issuer?.createdAt)
    };

    const name = {
      type: TableCellTypes.LINK,
      value: issuer.name,
      onClick: `/issuer/${issuer.id}`
    };

    const email = {
      type: TableCellTypes.STRING,
      value: issuer.email
    };

    const totalProducts = {
      type: TableCellTypes.STRING,
      value: issuer.totalProducts ? issuer.totalProducts.toString() : '0'
    };

    const totalVolume = {
      type: TableCellTypes.CURRENCY,
      value: issuer.totalVolumeAllProducts ? issuer.totalVolumeAllProducts.toString() : '0'
    };

    const status = {
      type: TableCellTypes.STATUS,
      value: t(
        `${tPath}.status.${(issuer.status || Status.processing).toLowerCase()}`
      ),
      status: issuer.status || Status.processing,
    };

    return [
      date,
      name,
      email,
      totalProducts,
      totalVolume,
      status
    ] as TableCell[];
  });
};
