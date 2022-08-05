import { t } from "i18next";
import { ComplianceLogItem, Status } from "../../../../../../shared/types/common";
import { Holding } from "../../../../../../shared/types/holding";
import { ComplexInvestor, isNaturalPerson, LegalEntityInvestor } from "../../../../../../shared/types/investor";
import { Transaction } from "../../../../../../shared/types/transaction";
import { Product, ProductCategory } from "../../../../../../shared/types/product";
import { formatDate, getOutstandingCapital, getProductTotalAmount, getTransactionTotalPrice, getTransactionType, getUrlComplianceLog, toCamelCase } from "../../../../utils";

import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row, TableCell, TableCellTypes } from "../../../components/UI/Table";
import { getColorForColoredString, MAX_VALUE_LENGTH } from "../../../components/UI/Table/table.constants";

export const limitComplianceLog = 10;

const tPath = 'components.table';


export const createInvestorDetails = (investor: Partial<ComplexInvestor>): ListItemProps[] => {
  const type = t(`${tPath}.investors.type.${isNaturalPerson(investor) ? 'naturalPerson' : 'legalEntity'}`);

  const name = isNaturalPerson(investor) ? [
    {
      title: t('pages.investors.view.details.list.firstName'),
      content: investor.firstName
    },
    {
      title: t('pages.investors.view.details.list.lastName'),
      content: investor.lastName
    },
  ] : [
    {
      title: t('pages.investors.view.details.list.companyName'),
      content: (investor as LegalEntityInvestor).companyName
    }
  ];

  const bsn = isNaturalPerson(investor) ? [
    {
      title: t('pages.investors.view.details.list.bsn'),
      content: investor.bsn
    }
  ] : [];

  return [
    {
      title: t('pages.investors.view.details.list.status'),
      content: t(`${tPath}.status.${investor.status!.toLowerCase()}`),
      status: investor.status as unknown as Status,
      isStatus: true,
    },
    {
      title: t('pages.investors.view.details.list.createdOn'),
      content: formatDate(investor.createdAt)
    },
    {
      title: t('pages.investors.view.details.list.entityType'),
      content: type
    },

    ...name,

    {
      title: t('pages.investors.view.details.list.email'),
      content: investor.email
    },
    {
      title: t('pages.investors.view.details.list.phone'),
      content: investor.phone
    },

    ...bsn,

    {
      title: t('pages.investors.view.details.list.address'),
      content: investor.address
    },
    {
      title: t('pages.investors.view.details.list.postcode'),
      content: investor.postcode
    },
    {
      title: t('pages.investors.view.details.list.city'),
      content: investor.city
    }
  ];
};

type InvestorSummary = {
  totalRecieved: number;
  totalOriginalAmount: number;
  totalHoldings: number;
  totalTransactions: number;
};

export const createInvestorSummary = ({ totalRecieved, totalOriginalAmount, totalHoldings, totalTransactions }: InvestorSummary): ListItemProps[] => [
  {
    title: t('pages.investors.view.summary.list.recieved'),
    content: totalRecieved.toString(),
    isAmount: true
  },
  {
    title: t('pages.investors.view.summary.list.payments'),
    content: totalOriginalAmount?.toString(),
    isAmount: true,
  },
  {
    title: t('pages.investors.view.summary.list.holdings'),
    content: totalHoldings.toString(),
    contentClasses: 'list-item__montserrat'
  },
  {
    title: t('pages.investors.view.summary.list.transactions'),
    content: totalTransactions.toString(),
    contentClasses: 'list-item__montserrat'
  }
];

export const createInvestorHoldingsRows = (holdings: Holding[]): Row[] => {
  return holdings.map((holding: Holding) => {
    const { name, product, heldSince } = holding;

    const holdingName = name;
    const withTooltip = holdingName.length > MAX_VALUE_LENGTH;

    const isOutStandingCapitalDisplayed = holding.category === ProductCategory.Bond;

    return [
      {
        type: TableCellTypes.LINK,
        value: holdingName,
        onClick: `/products/${(product as Product).id}`,
        withTooltip
      },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.products.category.${(product as Product).category.toLowerCase()}`)
      },
      {
        type: TableCellTypes.CURRENCY,
        value: getProductTotalAmount(holding).toString()
      },
      {
        type: isOutStandingCapitalDisplayed ? TableCellTypes.CURRENCY : TableCellTypes.STRING,
        value: isOutStandingCapitalDisplayed ? getOutstandingCapital(holding).toString() : 'N/A',
        contentClasses: 'table-cell__centered'
      },
      {
        type: TableCellTypes.CURRENCY,
        value: holding?.amountReceived ? (holding.amountReceived).toFixed(2) : '0'
      },
      {
        type: TableCellTypes.DATE,
        value: formatDate(heldSince),
      },
      {
        type: TableCellTypes.DATE,
        value: formatDate(holding.maturityDate!),
      },
      {
        type: TableCellTypes.DATE,
        value: holding.nonCallPeriod ? formatDate(holding.nonCallPeriod) : "N/A",
      },
    ] as TableCell[];
  });
};

export const createInvestorTransactionsRows = (transactions: Transaction[], id?: string): Row[] => {
  return transactions.map(transaction => {
    const productName = transaction.product.name;
    const withTooltip = productName.length > MAX_VALUE_LENGTH;

    const transactionType = getTransactionType(transaction, id);

    return [
      {
        type: TableCellTypes.DATE,
        value: transaction?.createdAt ? formatDate(transaction?.createdAt) : 'N/A'
      },
      {
        type: TableCellTypes.COLORED_STRING,
        value: t(`${tPath}.transactions.type.${transactionType.toLowerCase()}`),
        color: getColorForColoredString(transactionType)
      },
      {
        type: TableCellTypes.LINK,
        value: productName,
        onClick: `/products/${transaction.product.id}`,
        withTooltip
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
    }
  ]);
};

export const holdingsTableHeader = [
  'pages.investors.view.holdings.table.head.holding',
  'pages.investors.view.holdings.table.head.category',
  'pages.investors.view.holdings.table.head.originalAmount',
  'pages.investors.view.holdings.table.head.outstandingAmount',
  'pages.investors.view.holdings.table.head.amountRecieved',
  'pages.investors.view.holdings.table.head.heldSince',
  'pages.investors.view.holdings.table.head.maturityDate',
  'pages.investors.view.holdings.table.head.nonCallPeriod'
];

export const transactionsTableHeader = [
  'pages.investors.view.transactions.table.head.date',
  'pages.investors.view.transactions.table.head.type',
  'pages.investors.view.transactions.table.head.product',
  'pages.investors.view.transactions.table.head.amount',
  'pages.investors.view.transactions.table.head.status'
];

export const complianceLogTHeader = [
  'pages.admin.overview.complianceLog.table.head.date',
  'pages.admin.overview.complianceLog.table.head.action',
  'pages.admin.overview.complianceLog.table.head.remarks',
  'pages.admin.overview.complianceLog.table.head.status',
];

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

