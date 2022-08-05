/* eslint-disable @typescript-eslint/no-use-before-define */
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { To, useNavigate } from "react-router";

import { TableCell, TableCellTypes } from "./";

import { TextColors } from "./table.constants";

import { ApproveOptions, CellStatus, ComplianceLogItem, ComplianceStatus, Filter, Roles } from "../../../../../../shared/types/common";
import { Button } from "../index";
import { CheckMarkIcon } from "../../icons";
import AdminService from "../../../../services/AdminService";
import { useEffect, useMemo, useState } from "react";
import ComplianceContext from "../../../../store/contexts/compliance-log-context";
import { Spinner } from "../Spinner";
import { useSnackbar } from "../../Hooks/useSnackbar";
import Snackbar from "../Snackbar";
import UserContext from "../../../../store/contexts/user-context";
import { createQueryString } from "../../../../utils";
import { ButtonView } from "../Button/button.props";

const renderSwitch = ({
  type,
  value,
  onClick,
  status,
  color,
  stringWithLinkData,
  tooltip,
  decision,
  contentClasses,
  withTooltip = false,
  approveOptions = {
    limit: 10,
    skip: 0,
    filter: {},
    callback: undefined
  }
}: TableCell) => {
  const { data: { role } } = UserContext.useContext();

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const { t } = useTranslation();

  const navigate = useNavigate();

  const onTooltipSwitch = () => {
    if (!tooltip) return;

    setIsTooltipOpen(prev => !prev);
  };

  const tooltipClasses = useMemo(() => classNames("table__tooltip", {
    "table__tooltip--open": isTooltipOpen
  }), [isTooltipOpen]);



  switch (type) {
    case TableCellTypes.STRING:
      let displayValue = value;

      const tempValue = value as string;

      ["years", "months"].forEach((el) => {
        if (tempValue && tempValue?.includes(el))
          displayValue = tempValue?.replace(el, t(el));
      });

      return (
        <p
          className={classNames("table__string", contentClasses, {
            "with-tooltip": withTooltip,
            "table__string--with-number": !isNaN(Number(value))
          })}
          data-tooltip={displayValue}
        >
          {t(displayValue)}
        </p>
      );

    case TableCellTypes.PERCENT:
      return value ? (
        <p className={classNames("table__string", contentClasses)}>
          {Number(value).toFixed(2)}&nbsp;%
        </p>
      ) : 'N/A';

    case TableCellTypes.LINK:
      const clickHandler = onClick ? () =>  navigate(onClick as To) : null;
      return (
        <p
          className={classNames("table__link", contentClasses, {
            "with-tooltip": withTooltip
          })}
          onClick={clickHandler as any}
          data-tooltip={value}
        >
          {value}
        </p>
      );

    case TableCellTypes.DATE:
      return <p className={classNames("table__date", contentClasses)}>{value}</p>;

    case TableCellTypes.CURRENCY:
      return (
        <NumberFormat
          value={Number(value) || 0}
          style={{ color: color ? color : "#000000" }}
          displayType={"text"}
          decimalScale={2}
          fixedDecimalScale
          thousandSeparator="."
          decimalSeparator=","
          prefix={"€\u00a0"}
        />
      );

    case TableCellTypes.STATUS:
      return <StatusCell contentClasses={contentClasses} value={value} status={status} />;

    case TableCellTypes.COLORED_STRING:
      const colorValue: TextColors = color || TextColors.gray;

      return (
        <p
          className={classNames(
            contentClasses,
            "table__colored-string",
            `table__colored-string-${colorValue}`
          )}
        >
          {value}
        </p>
      );

    case TableCellTypes.STRING_WITH_LINK:
      return (
        <section className='table__string-with-link'>
          <p className={classNames({
            "with-tooltip": withTooltip
          })}
          onMouseEnter={onTooltipSwitch}
          onMouseLeave={onTooltipSwitch}
          >
            {stringWithLinkData!.map((item) => {
              return item.type === TableCellTypes.STRING ? (
                <span key={item.value}>
                  {item.value.replaceAll(" ", "\u00a0")}&nbsp;
                </span>
              ) : (
                <span
                  key={item.value}
                  className="table__link"
                  onClick={() => item?.onClick && navigate(item.onClick)}
                >
                  {item.value.replaceAll(" ", "\u00a0")}&nbsp;
                </span>
              );
            })}
          </p>

          {Boolean(tooltip) ? (
            <div className={tooltipClasses}>
              {tooltip}
            </div>
          ) : null}

        </section>
      );

    case TableCellTypes.DECISION:
      if (role === Roles.compliance && decision!.status === ComplianceStatus.Initiated)
      return <DecisionCell value={value} approveOptions={approveOptions} />;

      return <StatusCell contentClasses={contentClasses} value={decision!.value} status={decision!.status as unknown as CellStatus} />;

    default:
      return null;
  }
};

type StatusCellProps = Pick<TableCell, 'contentClasses' | 'value' | 'status'>;
const StatusCell = ({ contentClasses, value, status }: StatusCellProps) => (
  <div className={classNames("table__status-wrapper", contentClasses)}>
    <div
      className={classNames(
        "table__status",
        `table__status_${status?.toLowerCase()}`,
      )}
    ></div>

    <p>{value}</p>
  </div>
);

type DecisionCellProps = {
  value: string,
  approveOptions: ApproveOptions
};
const DecisionCell = ({ value, approveOptions }: DecisionCellProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setLoading] = useState(false);

  const { data, setData: setComplianceData } = ComplianceContext.useContext();
  const { isActive, message, openSnackBar } = useSnackbar();

  const { t } = useTranslation();

  const requestComplianceLog = async (skip: number = 0, limit: number = 10, filter: Filter<ComplianceLogItem> | undefined = undefined) => {
    const requestQuery = createQueryString({ skip, limit, ...filter });

    await AdminService.getComplianceList(requestQuery).then(res => setComplianceData({ logs: res.data.data }));
  };

  const onReject = (id: string) => async () => {
    setComplianceData({ rejectLogId: id });
    setLoading(true);
  };

  const onApprove = (id: string) => async () => {
    setLoading(true);

    const { skip, limit, filter, callback } = approveOptions;

    await AdminService.approveCompliance(id)
      .then(callback || (() => requestComplianceLog(skip, limit, filter)))
      .catch(err => {
        openSnackBar(err.response.data.message);
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!data.rejectLogId) setLoading(false);
  }, [data.rejectLogId]);

  return (
    isLoading ? (
      <Spinner />
    ) : (
      <section className='table__decision'>
        <Button
          view={ButtonView.redLayout}
          onClick={onReject(value)}
          disabled={isLoading}
        >
          {t('pages.admin.overview.complianceLog.reject')}
        </Button>

        <Button
          view={ButtonView.green}
          onClick={onApprove(value)}
          disabled={isLoading}
        >
          <CheckMarkIcon width="16px" height="16px" />

          {t('pages.admin.overview.complianceLog.approve')}
        </Button>

        <Snackbar message={message} isActive={isActive} />
      </section>
    )
  );
};

const TableCellView = (cellData: TableCell) => {
  const cellClasses = classNames(`table-cell__${cellData.type}`, {
    'table-cell__centered': cellData?.isCentered
  });

  return <td className={cellClasses}>{renderSwitch(cellData)}</td>;
};

export default TableCellView;

