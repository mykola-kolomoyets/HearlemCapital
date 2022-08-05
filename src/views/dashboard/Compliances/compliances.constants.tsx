import { t } from "i18next";
import {
  ComplianceLogItem,
  Roles,
} from "../../../../../shared/types/common";

import {
  formatDate,
  getUrlComplianceLog,
  toCamelCase,
} from "../../../utils";

import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";
import ComplianceActionTooltip from "./ComplianceTooltip";

export const limitStep = 10;

const tPath = 'components.table.complianceLog';

const getRequestedName = (
  requestedBy: ComplianceLogItem["requestedBy"] | undefined
): string => {
  if (!requestedBy) return "-";

  if (
    requestedBy?.role === Roles.admin ||
    (requestedBy?.role === Roles.investor &&
      requestedBy.type === "Natural person")
  )
    return `${requestedBy.firstName} ${requestedBy.lastName}`;

  if (
    requestedBy?.role === Roles.investor &&
    requestedBy.type === "Legal entity"
  )
    return requestedBy?.companyName;

  if (requestedBy?.role === Roles.issuer) return requestedBy?.name as string;

  return "-";
};

export const createComplianceLogRows = (
  userId: string,
  data: ComplianceLogItem[]
): Row[] => {
  if (!data) return [];

  return data.map((item: ComplianceLogItem) => {
    const logDate = {
      type: TableCellTypes.DATE,
      value: formatDate(item.date),
    };

    const isArrayPayment = item.action.investors && item.action.investors?.length > 0 || false;

    const requestedBy = {
      type: TableCellTypes.STRING_WITH_LINK,
      value: "",
      stringWithLinkData: !isArrayPayment 
      ? [
          {
            type: TableCellTypes.LINK,
            value: getRequestedName(item.requestedBy),
            onClick:
              item.requestedBy?.role !== Roles.admin
                ? `/${item.requestedBy?.role}/${item.requestedBy?.id}`
                : undefined,
          },
          {
            type: TableCellTypes.STRING,
            value: `(${t(`${tPath}.entity.${item.action.entity.toLowerCase()}`).toLowerCase()})`,
          },
        ] 
        : [
          {
            type: TableCellTypes.LINK,
            value: item.action.entityName,
            onClick: getUrlComplianceLog(item),
          }
        ],
    };

    let actionNameValue = item.action.paymentType 
      ? t(`${tPath}.action.${toCamelCase(item.action.paymentType)}`) 
      : t(`${tPath}.action.${toCamelCase(item.action.name)}`);

    if (isArrayPayment) {
      actionNameValue += ' ' + t(`${tPath}.toAllInvestors`);
    }

    const actionName: TableCell[] = [
      {
        type: TableCellTypes.STRING,
        value: actionNameValue,
      },
    ];

    if (!isArrayPayment) {
      actionName.push({
        type: TableCellTypes.LINK,
        value: item.action.entityName,
        onClick: getUrlComplianceLog(item),
      });
    }

    const receiverData = item.action.receiver ? [
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.to`),
      },
      {
        type: TableCellTypes.LINK,
        value: item.action.receiver?.name,
        onClick: `/${item.action.receiver.role}/${item.action.receiver?.id}`,
      }
    ] : [];

    const action = {
      type: TableCellTypes.STRING_WITH_LINK,
      value: "",
      tooltip: <ComplianceActionTooltip items={item.action.investors}/>,
      stringWithLinkData: [
        ...actionName,
        ...receiverData
      ],
    };

    const remarks = {
      type: TableCellTypes.STRING,
      value: item.remarks || "",
    };

    const status = {
      type: TableCellTypes.DECISION,
      value: item.id || "",
      status: item.status,
      decision: {
        status: item.status,
        value: t(`${tPath}.status.${item.status.toLowerCase()}`),
      },
    };

    return [
      logDate,
      requestedBy,
      action,
      remarks,
      status,
    ];
  });
};

export const complianceLogTHeader = [
  "pages.admin.overview.complianceLog.table.head.date",
  "pages.admin.overview.complianceLog.table.head.relatedTo",
  "pages.admin.overview.complianceLog.table.head.action",
  "pages.admin.overview.complianceLog.table.head.remarks",
  "pages.admin.overview.complianceLog.table.head.status",
];
