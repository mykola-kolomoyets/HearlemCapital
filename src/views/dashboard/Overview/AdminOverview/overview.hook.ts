import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import AdminService from "../../../../services/AdminService";

import UserContext from "../../../../store/contexts/user-context";

import { AdminChartData, AdminOverview } from "../../../../../../shared/types/admin";

import { getProductTotalAmount, showDeltaPercents, translate, transpose, enableScroll, summ, summToRight } from "../../../../utils/fn";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";
import { labels as monthsLabels } from "../../../components/UI/LineChart/line-chart.constants";

import {
  createChartData,
  createInvestorsRows,
  createProductRows,
  createTransactionRows,
  observerOptions,
  pendingInvestorsTHeader,
  pendingProductsTHeader,
  pendingTransactionsTHeader,
  platformOverviewLabels,
  tooltipLabels,
  transactionVolumeLabelData,
} from "./overview.constants";
import ComplianceContext from "../../../../store/contexts/compliance-log-context";
import { complianceLogTHeader, createComplianceLogRows } from "../../Compliances/compliances.constants";


export const useOverview = () => {
  const { data: { name, id } } = UserContext.useContext();
  const {
    data: { logs },
    setData: setComplianceData
  } = ComplianceContext.useContext();

  const [chartDatasets, setChartDatasets] = useState<AdminChartData>([]);

  const [pendingProducts, setPendingProducts] = useState<Row[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Row[]>([]);
  const [pendingInvestors, setPendingInvestors] = useState<Row[]>([]);
  const [complianceLog, setComplianceLog] = useState<Row[]>([]);

  const [platformOverview, setPlatformOverview] = useState<ListItemProps[]>([]);

  const [platformOverviewPercents, setPlatformOverviewPercents] = useState<(number | null)[]>([]);

  const [isProductsFetching, setProductsFetching] = useState(true);
  const [isTransactionsFetching, setTransactionsFetching] = useState(true);
  const [isInvestorsFetching, setInvestorsFetching] = useState(true);
  const [isComplianceLogFetching, setComplianceLogFetching] = useState(true);

  const [isProductsVisible, setIsProductsVisible] = useState(false);
  const [isTransactionsVisible, setIsTransactionsVisible] = useState(false);
  const [isInvestorsVisible, setIsInvestorsVisible] = useState(false);
  const [isComplianceLogVisible, setComplianceLogVisible] = useState(false);

  const pendingProductsRef = useRef<HTMLDivElement>(null);
  const pendingTransactionsRef = useRef<HTMLDivElement>(null);
  const pendingInvestorsRef = useRef<HTMLDivElement>(null);
  const complianceLogRef = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();

  const { width } = useWindowSize();

  const navigate = useNavigate();

  const observerCallback = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    const entryClassName = entry.target.className.split('__')[1];

    switch (entryClassName) {
      case 'products-content':
        setIsProductsVisible(entry.isIntersecting as boolean);
        break;
      case 'transactions-content':
        setIsTransactionsVisible(entry.isIntersecting as boolean);
        break;
      case 'investors-content':
        setIsInvestorsVisible(entry.isIntersecting as boolean);
        break;
      case 'compliance-log-content':
        setComplianceLogVisible(entry.isIntersecting as boolean);
        break;
      }
  };

  const onViewClick = (to: string) => navigate(`/admin/${to}`);

  const platformOverviewList: ListItemProps[] = [
    {
      title: t('pages.overview.porifolio.summary.totalAmount'),
      content: "",
      isAmount: true,
      contentClasses: "admin-overview__recieved-amount",
    },
    {
      title: t('pages.overview.porifolio.summary.originalAmount'),
      content: "",
      isAmount: true,
    },
    {
      title: t('pages.overview.porifolio.summary.yield'),
      content: "",
      contentClasses: "list-item__montserrat",
    },
  ];

  const pendingInvestorsTableHeader = translate(pendingInvestorsTHeader);

  const pendingProductsTableHeader = translate(pendingProductsTHeader);

  const pendingTransactionsTableHeader = translate(pendingTransactionsTHeader);

  const complianceLogTableHeader = translate(complianceLogTHeader);

  const tooltips = translate(tooltipLabels);

  const chartData = useMemo(() => {
    const numbers = chartDatasets.map(item => Object.entries(item).map(value => value[1] || 0).slice(1));

    const totalVolumes = numbers.map((item, index) => (summ(item)) + (index > 0 ? summ(numbers[index - 1]) : 0));

    let datasetsData = transpose(numbers)
      .map((item) => summToRight(item));

    datasetsData.push(totalVolumes);

    const datasets = createChartData(tooltips, datasetsData);

    const labels = chartDatasets.map(item => `${monthsLabels[item.period].slice(0, 3)} ${new Date().getFullYear()}`);

    return {
      isShow: datasets.every(dataset => dataset?.data?.length),
      values: { labels, datasets }
    };
  }, [chartDatasets]);


  useEffect(() => {
    [pendingProductsRef, pendingTransactionsRef, pendingInvestorsRef, complianceLogRef].forEach(ref => {
      const observer = new IntersectionObserver(observerCallback, observerOptions);
      if (ref.current) observer.observe(ref.current);

      return () => {
        if (pendingProductsRef.current) observer.unobserve(pendingProductsRef.current);
      };
    });
  }, [
    pendingProductsRef,
    pendingTransactionsRef,
    pendingInvestorsRef,
    complianceLogRef,
    observerOptions
  ]);

  useEffect(() => {
    if (id) {
      enableScroll();

      AdminService.getOverview(id)
        .then(res => {
          const response: AdminOverview = res.data;

          const {
            chartData: chartInfo,
            investors,
            products,
            transactions,
            compliances,
            lastPeriodPayment,
            lastPeriodTransactions,
            lastPeriodVolume
          } = response;

          const portfolioOverviewValues = [
            lastPeriodVolume.currentValue,
            lastPeriodPayment.currentValue,
            lastPeriodTransactions.currentValue
          ];

          setChartDatasets(chartInfo);

          setPlatformOverviewPercents([
            showDeltaPercents(lastPeriodVolume.currentValue, lastPeriodVolume.previousValue),
            showDeltaPercents(lastPeriodPayment.currentValue, lastPeriodPayment.previousValue),
            showDeltaPercents(lastPeriodTransactions.currentValue, lastPeriodTransactions.previousValue)
          ]);

          const platformOverviewData = platformOverviewList.map((item, index) => ({
            ...item,
            title: t(platformOverviewLabels[index]),
            content: portfolioOverviewValues[index].toString()
          }));

          const sortedProducts = products.sort((curr, next) => getProductTotalAmount(next) - getProductTotalAmount(curr));

          const investorsRows: Row[] = createInvestorsRows(investors);
          const productRows = createProductRows(sortedProducts);
          const transactionsRows = createTransactionRows(transactions);

          setPlatformOverview(platformOverviewData);
          setPendingInvestors(investorsRows.slice(0, 5));
          setPendingProducts(productRows.slice(0, 5));
          setPendingTransactions(transactionsRows.slice(0, 5));
          setComplianceData({ logs: compliances.slice(0, 5) });
        })
        .catch(error => console.log(error));
    }
  }, [id, i18n.language ]);

  useEffect(() => {
    if (isProductsVisible) setProductsFetching(false);
  }, [isProductsVisible]);

  useEffect(() => {
    if (isTransactionsVisible) setTransactionsFetching(false);
  }, [isTransactionsVisible]);

  useEffect(() => {
    if (isInvestorsVisible) setInvestorsFetching(false);
  }, [isInvestorsVisible]);

  useEffect(() => {
    if (isComplianceLogVisible && isComplianceLogFetching) setComplianceLogFetching(false);
  }, [isComplianceLogVisible]);

  useEffect(() => setComplianceLog(createComplianceLogRows(id, logs.slice(0, 5))), [logs]);

  return {
    t,
    i18n,
    name,
    width,
    platformOverview,
    platformOverviewPercents,
    pendingProductsTableHeader,
    pendingInvestorsTableHeader,
    pendingTransactionsTableHeader,
    complianceLogTableHeader,
    pendingInvestors,
    pendingProducts,
    pendingTransactions,
    complianceLog,
    isProductsFetching,
    isTransactionsFetching,
    isInvestorsFetching,
    isComplianceLogFetching,
    onViewClick,
    pendingProductsRef,
    pendingTransactionsRef,
    pendingInvestorsRef,
    complianceLogRef,
    chartData,
    tooltips,
    transactionVolumeLabelData
  };
};
