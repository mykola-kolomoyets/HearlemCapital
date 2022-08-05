import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { createQueryString, getErrorMessageName, translate } from "../../../../utils/fn";

import { Issuer } from "../../../../../../shared/types/issuer";
import { Product } from "../../../../../../shared/types/product";
import { Transaction } from "../../../../../../shared/types/transaction";
import { AccountStatus } from "../../../../../../shared/types/common";

import IssuerService from "../../../../services/IssuerService";
import AdminService from "../../../../services/AdminService";
import UserService from "../../../../services/UserService";

import ComplianceContext from "../../../../store/contexts/compliance-log-context";
import UserContext from "../../../../store/contexts/user-context";
import SummaryContext from "../../../../store/contexts/summary-context";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";

import {
  complianceLogTHeader,
  createComplianceLogRows,
  createIssuerDetails,
  createIssuerProductsRows,
  createIssuerSummary,
  createIssuerTransactionsRows,
  productTableHeader,
  transactionsTableHeader,
  limitComplianceLog
} from "./issuer-view.constants";
import { Query } from "../../../../../../shared/types/response";
import { BreadcrumpItem } from "../../../components/UI/Breadcrumps";

type IssuerViewParams = 'id';

const useIssuerView = () => {
  const { data: { role, id: userId } } = UserContext.useContext();
  const { setData: setSummaryData } = SummaryContext.useContext();

  const {
    data: { rejectLogId, logs: compliances },
    setData: setComplianceData,
  } = ComplianceContext.useContext();

  const [name, setName] = useState('');

  const [skipComplianceLog, setSkipComplianceLog] = useState(0);
  const [totalComplianceLog, setTotalComplianceLog] = useState(0);
  const [showFromCountComplianceLog, setShowFromCountComplianceLog] = useState(1);

  const [isFetching, setIsFetching] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [isComplianceLogFetching, setComplianceLogFetching] = useState(true);
  const [showDeactivateFail, setShowDeactivateFail] = useState(false);


  const [details, setDetails] = useState<ListItemProps[]>([]);
  const [summary, setSummary] = useState<ListItemProps[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [productsRows, setProductsRows] = useState<Row[]>([]);
  const [transactionsRows, setTransactionsRows] = useState<Row[]>([]);
  const [complianceLog, setComplianceLog] = useState<Row[]>([]);

  const [issuerData, setIssuerData] = useState<Partial<Issuer>>({});

  const [filterComplianceLog, setFilterComplianceLog] = useState({});

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const { id } = useParams<IssuerViewParams>();

  const breadcrumps: BreadcrumpItem[] = [
    {
      label: t('menu.breadcrumps.issuers'),
      path: 'issuers'
    },
    { label: (name as string) }
  ];

  const productTHeader = useMemo(() => translate(productTableHeader), [i18n.language]);

  const transactionsTHeader = useMemo(() => translate(transactionsTableHeader), [i18n.language]);

  const complianceLogTableHeader = complianceLogTHeader.map(item => t(item));

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

        setIssuerData({
          ...issuerData,
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

  const onAfterDeleteUser = () => {
    onToggleConfirmDeleteUser();
    navigate(`/${role}/issuers`);
  };

  const getIssuerData = () => {
    IssuerService.getComplex(id!)
    .then(res => {
      const { data } = res;

      const {
        name: issuerName,

        totalInvestors,
        totalPayOut,
        totalVolume,

        products: {
          data: productData,
          count: totalProducts
        },
        transactions: {
          data: transactionData,
          // count: totalTransactions
        }
      } = data;

      const issuerDetailsData = createIssuerDetails(data);

      const issuerSummaryData = createIssuerSummary({
        totalProducts,
        totalVolume,
        totalInvestors,
        totalPayOut
      });

      const issuerProductsRows = createIssuerProductsRows(productData);

      const issuerTransactionsRows = createIssuerTransactionsRows(transactionData);

      const { email, phone, kvk, vat, address, postcode, city, status, isRequestDeactivate } = data;

      setIssuerData({
        name: issuerName,
        email,
        role,
        phone,
        kvk: kvk ? kvk.toString() : '',
        vat,
        address,
        postcode,
        city,
        status,
        isRequestDeactivate
      });

      setName(issuerName);

      setDetails(issuerDetailsData);
      setSummary(issuerSummaryData);

      setProducts(productData);
      setTransactions(transactionData);

      setProductsRows(issuerProductsRows);
      setTransactionsRows(issuerTransactionsRows);
    })
    .catch((error) => {
      console.log(error);

      if (role && error?.response?.status === 404) navigate(`/${role}/issuers`);
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
    getIssuerData();
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

  const isIssuerActive = useMemo(() =>  issuerData.status !== AccountStatus.inactive, [issuerData.status]);

  useEffect(() => {
    if (!showEditForm) {
      getIssuerData();
    }
  }, [showEditForm, role, i18n.language]);

  useEffect(() => {
    if (id && userId && !showEditForm) {
      getComplianceList();
    }
  }, [id, userId, showEditForm, skipComplianceLog]);

  useEffect(() => {
    setComplianceLog(createComplianceLogRows(userId, compliances));
  }, [compliances, i18n.language]);

  return {
    t,
    width,
    isFetching,
    breadcrumps,
    name,
    role,
    details,
    summary,
    products,
    transactions,
    productsRows,
    transactionsRows,
    productTHeader,
    transactionsTHeader,
    complianceLog,
    complianceLogTableHeader,
    showEditForm,
    onToggleEditForm,
    issuerData,
    issuerId: id!,
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
    showDeleteUserConfirm,
    onToggleConfirmDeleteUser,
    onRequestDeactivate,
    showDeactivateFail,
    onAfterDeleteUser,
    showRejectFormComplianceLog: Boolean(rejectLogId),
    isIssuerActive
  };
};

export { useIssuerView };
