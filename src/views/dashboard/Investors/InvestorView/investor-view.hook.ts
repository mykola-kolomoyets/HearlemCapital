import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AccountStatus } from "../../../../../../shared/types/common";

import { Holding } from "../../../../../../shared/types/holding";
import { Investor, isLegalEntity, isNaturalPerson } from "../../../../../../shared/types/investor";
import { Query } from "../../../../../../shared/types/response";
import { Transaction } from "../../../../../../shared/types/transaction";
import AdminService from "../../../../services/AdminService";

import InvestorService from "../../../../services/InvestorService";
import UserService from "../../../../services/UserService";
import ComplianceContext from "../../../../store/contexts/compliance-log-context";
import SummaryContext from "../../../../store/contexts/summary-context";
import UserContext from "../../../../store/contexts/user-context";
import { createQueryString, getErrorMessageName, getProductTotalAmount, sortDate, translate } from "../../../../utils";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { BreadcrumpItem } from "../../../components/UI/Breadcrumps";
import { HorizontalStackedBarData } from "../../../components/UI/HorizontalStackedBar";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";
import { SortingDirection } from "../../../components/UI/Table/Table.utils";

import {
  colors,
  complianceLogTHeader,
  createComplianceLogRows,
  createInvestorDetails,
  createInvestorHoldingsRows,
  createInvestorSummary,
  createInvestorTransactionsRows,
  holdingsTableHeader,
  limitComplianceLog,
  transactionsTableHeader
} from "./investor-view.constants";

type InvestorViewParams = 'id';

const useInvestorView = () => {
  const [name, setName] = useState('');

  const [isFetching, setIsFetching] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeactivateFail, setShowDeactivateFail] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);

  const [details, setDetails] = useState<ListItemProps[]>([]);
  const [summary, setSummary] = useState<ListItemProps[]>([]);

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [holdingsChartData, setHoldingsChartData] = useState<HorizontalStackedBarData[]>([]);

  const [holdingsRows, setHoldingsRows] = useState<Row[]>([]);
  const [transactionsRows, setTransactionsRows] = useState<Row[]>([]);
  const [complianceLog, setComplianceLog] = useState<Row[]>([]);

  const [investorData, setInvestorData] = useState<Partial<Investor>>({});

  const { setData: setSummaryData } = SummaryContext.useContext();
  const { data: { role, id: userId } } = UserContext.useContext();

  const {
    data: { rejectLogId, logs: compliances },
    setData: setComplianceData,
  } = ComplianceContext.useContext();

  const [filterComplianceLog, setFilterComplianceLog] = useState({});
  const [skipComplianceLog, setSkipComplianceLog] = useState(0);
  const [totalComplianceLog, setTotalComplianceLog] = useState(0);
  const [isComplianceLogFetching, setComplianceLogFetching] = useState(true);
  const [showFromCountComplianceLog, setShowFromCountComplianceLog] = useState(1);

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const { id } = useParams<InvestorViewParams>();

  const breadcrumps: BreadcrumpItem[] = [
    {
      label: t('menu.breadcrumps.investors'),
      path: 'investors'
    },
    { label: (name as string) }
  ];

  const complianceLogTableHeader = complianceLogTHeader.map(item => t(item));

  const holdingsTHeader = useMemo(() => translate(holdingsTableHeader), [i18n.language]);
  const transactionsTHeader = useMemo(() => translate(transactionsTableHeader), [i18n.language]);

  const onToggleEditForm = () => setShowEditForm(show => !show);

  const onToggleConfirmDeleteUser = () => setShowDeleteUserConfirm(show => !show);

  const onFailClose = () => setShowDeactivateFail(false);

  const onRequestDeactivate = () => {
    UserService.deactivate(id!)
      .then(() => {
        setSummaryData({
          isShown: true,
          isSuccess: true,
          title: 'pages.investors.view.deactivateSuccess.title',
          subtitle: 'pages.investors.view.deactivateSuccess.subtitle'
        });

        setInvestorData({
          ...investorData,
          isRequestDeactivate: true
        });
      })
      .catch(err => {
        console.log(err);
        setShowDeactivateFail(true);

        const errorMessageName = getErrorMessageName(err.response.data.stack);
        const errorMsg = `error.backend.${errorMessageName}`;

        setSummaryData({
          isShown: true,
          isSuccess: false,
          title: 'pages.investors.view.deactivateError.title',
          subtitle: errorMsg,
          onCloseCallback: onFailClose
        });
      });
  };

  const onAfterDeleteCallback = () => {
    onToggleConfirmDeleteUser();

    navigate(`/${role}/investors`);
  };

  const getInvestorData = () => {
    InvestorService.getComplex(id!)
    .then(res => {
      const { data } = res;

      const {
        totalRecieved,
        totalOriginalAmount,
        transactions: {
          data: investorTransactions,
          count: totalTransactions
        },
        holdings: {
          data: investorHoldings,
          count: totalHoldings
        }
      } = data;

      const investorName = isNaturalPerson(data) ?
        `${data.firstName} ${data.lastName}` :
        data.companyName;

      setName(investorName);

      setSummary(createInvestorSummary({
        totalRecieved,
        totalOriginalAmount,
        totalHoldings,
        totalTransactions
      }));

      const dataForChart: HorizontalStackedBarData[] = investorHoldings
        .slice(0, 5)
        .sort((curr, next) => sortDate(curr.heldSince, next.heldSince, SortingDirection.descending))
        .map((holding, index) => ({
          data: {
            label: holding.name,
            amount: getProductTotalAmount(holding),
            barColor: colors[index]
          },
        }));

      const { type, email, phone, address, postcode, city, status, isRequestDeactivate } = data;

      let investorInfo: Partial<Investor> = { type, email, phone, address, postcode, city, status, isRequestDeactivate };

      if (isNaturalPerson(data)) {
        const { firstName, lastName, bsn } = data;
        investorInfo = {
          ...investorInfo,
          ...{ firstName, lastName, bsn: bsn ? bsn.toString() : '' }
        };
      }

      if (isLegalEntity(data)) {
        const { kvk, companyName } = data;

        investorInfo = {
          ...investorInfo,
          ...{ kvk, companyName }
        };
      }

      setInvestorData(investorInfo);

      setHoldingsChartData(dataForChart);

      setHoldings(investorHoldings);
      setTransactions(investorTransactions);

      setDetails(createInvestorDetails(data));

      // setHoldingsRows(createInvestorHoldingsRows(investorHoldings));
      // setTransactionsRows(createInvestorTransactionsRows(investorTransactions, id!));
    })
    .catch((error) => {
      console.log(error);

      if (role && error?.response?.status === 404) navigate(`/${role}/investors`);
    })
    .finally(() => setIsFetching(false));
  };

  const getComplianceList = () => {
    const filter = { relatedUserId: id! };

    setFilterComplianceLog(filter);
    setComplianceLogFetching(true);

    const query: Query = {
      skip: skipComplianceLog,
      limit: limitComplianceLog,
      ...filter
    };

    AdminService.getComplianceList(createQueryString(query))
    .then((res) => {
      const { data, count } = res.data;

      setTotalComplianceLog(count);

      setComplianceData({
        rejectLogId:  '',
        logs: data
      });
    })
    .catch((error) => console.log(error))
    .finally(() => setComplianceLogFetching(false));
  };

  const callbackComplianceLogAction = () => {
    getInvestorData();
    getComplianceList();
  };

  const viewNewPageComplianceLog = (newSkip: number) => {
    setComplianceLogFetching(true);
    setSkipComplianceLog(newSkip);
    setShowFromCountComplianceLog(newSkip + 1);
  };

  const goNextPageComplianceLog = () => {
    const newSkip = skipComplianceLog + limitComplianceLog;

    if (newSkip > totalComplianceLog) return;

    viewNewPageComplianceLog(newSkip);
  };

  const goPrevPageComplianceLog = () => {
    const newSkip = skipComplianceLog - limitComplianceLog;

    if (newSkip < 0) return;

    viewNewPageComplianceLog(newSkip);
  };

  const onCloseRejectFormComplianceLog = () => setComplianceData({ rejectLogId: "" });

  useEffect(() => {
    if (!showEditForm) getInvestorData();
  }, [showEditForm, role, i18n.language]);

  useEffect(() => {
    if (id && userId && !showEditForm) {
      getComplianceList();
    }
  }, [id, userId, showEditForm, skipComplianceLog]);

  useEffect(() => {
    setComplianceLog(createComplianceLogRows(userId, compliances));
  }, [compliances, i18n.language]);

  useEffect(() => {
    setHoldingsRows(createInvestorHoldingsRows(holdings));
  }, [holdings, i18n.language]);

  useEffect(() => {
    setTransactionsRows(createInvestorTransactionsRows(transactions, id!));
  }, [transactions, i18n.language]);

  return {
    t,
    width,
    isFetching,
    breadcrumps,
    name,
    role,
    details,
    summary,
    holdings,
    transactions,
    holdingsRows,
    transactionsRows,
    holdingsTHeader,
    transactionsTHeader,
    holdingsChartData,
    complianceLogTableHeader,
    complianceLog,
    showEditForm,
    onToggleEditForm,
    investorData,
    investorId: id!,
    onRequestDeactivate,
    showDeactivateFail,
    onFailClose,
    isComplianceLogFetching,
    showFromCountComplianceLog,
    skipComplianceLog,
    limitComplianceLog,
    totalComplianceLog,
    goNextPageComplianceLog,
    goPrevPageComplianceLog,
    onCloseRejectFormComplianceLog,
    filterComplianceLog,
    callbackComplianceLogAction,
    showRejectFormComplianceLog: Boolean(rejectLogId),
    isInvestorActive: investorData.status !== AccountStatus.inactive,
    showDeleteUserConfirm,
    onToggleConfirmDeleteUser,
    onAfterDeleteCallback
  };
};

export { useInvestorView };
