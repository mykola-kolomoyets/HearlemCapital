import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import InvestorService from "../../../../services/InvestorService";

import UserContext  from "../../../../store/contexts/user-context";
import ChartContext from "../../../../store/contexts/chart-context";

import { createQueryString, getErrorMessageName, getProductTotalAmount, translate } from "../../../../utils";

import { InvestorChartData, InvestorIntervalChartData, InvestorOverview } from "../../../../../../shared/types/investor";
import { Label, ObjWithKeys, PeriodType } from "../../../../../../shared/types/common";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";

import { mockNews, NewsItem } from "./../News/news.constants";

import {
  createProductRows,
  createTransactionRows,
  lastTransactionsTHeader,
  observerOptions,
  tooltipLabels,
  topProductsTHeader,
  getAmountsArray,
  createChartDataset,
  defaultChartPeriodRange,
} from "./overview.constants";

import { getAnnullizedYield } from "../../Portfolio/portfolio.constants";
import { getChartCategories } from "./PortfolioSummary/portfolio-summary.constants";
import UserService from "../../../../services/UserService";
import SummaryContext from "../../../../store/contexts/summary-context";
import { Query } from "../../../../../../shared/types/response";
import { Locales } from "../../../../localization/models";
import { getCurrentTab } from "../../../components/UI/Tabs/tabs.utils";

export const useOverview = () => {
  const { data: { name, id } } = UserContext.useContext();
  const { setData: setChartData } = ChartContext.useContext();
  const { setData: setSummaryData } = SummaryContext.useContext();

  const { t, i18n } = useTranslation();

  const { width } = useWindowSize();

  const navigate = useNavigate();

  const chartCategories: ObjWithKeys<Label> = useMemo(() => getChartCategories(), [i18n.language]);

  const [chartCategory, setChartCategory] = useState<Label>(chartCategories.yearToDate);

  const [periodRange, setPeriodRange] = useState<string[]>(defaultChartPeriodRange);

  const [topProducts, setTopProducts] = useState<Row[]>([]);
  const [lastTransactions, setLastTransactions] = useState<Row[]>([]);

  const [news, setNews] = useState<NewsItem[]>([]);

  const [chartDatasets, setChartDatasets] = useState<InvestorChartData[] | InvestorIntervalChartData[]>([]);

  const [recievedAmount, setRecievedAmount] = useState<number>(0);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [annualizedYield, setAnnualizedYield] = useState<number>(0);

  const [isProductsFetching, setProductsFetching] = useState(true);
  const [isTransactionsFetching, setTransactionsFetching] = useState(true);
  const [isNewsFetching, setNewsFetching] = useState(true);
  const [isPortfolioFetching, setIsPortfolioFetching] = useState(true);
  const [showDeactivateFail, setShowDeactivateFail] = useState(false);
  const [isFetchedWithError, setIsFetchedWithError] = useState(false);
  const [isNewsVisible, setIsNewsVisible] = useState(false);

  const topProductsRef = useRef<HTMLDivElement>(null);
  const lastTransactionsRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  const topProductsTableHeader = translate(topProductsTHeader);
  const lastTransactionsTableHeader = translate(lastTransactionsTHeader);
  const tooltips = translate(tooltipLabels);

  const onFailClose = () => setShowDeactivateFail(false);

  const observerCallback = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    const entryClassName = entry.target.className.split('__')[1];

    switch (entryClassName) {
      case 'news-content':
        setIsNewsVisible(entry.isIntersecting as boolean);
        break;
    }
  };

  const onChartTabChange = (selected: string) => setChartCategory(getCurrentTab(chartCategories, selected));

  const onPeriodRangeChange = (range: string[]) => {
    setPeriodRange(range ?? defaultChartPeriodRange);
  };

  const onViewClick = (to: string) => navigate(`/investor/${to}`);

  const onViewNewsClick = () => navigate('/news');

  const portfolioSummaryList: ListItemProps[] = [
    {
      title: t('pages.overview.porifolio.summary.totalAmount'),
      content: recievedAmount.toString(),
      isAmount: true,
      contentClasses: "product-view__holdings__recieved-amount",
    },
    {
      title: t('pages.overview.porifolio.summary.originalAmount'),
      content: originalAmount.toString(),
      isAmount: true,
    },
    {
      title: t('pages.overview.porifolio.summary.yield'),
      content: annualizedYield ? `${annualizedYield.toFixed(2)}%` : '0.00%',
      contentClasses: "list-item__montserrat",
    },
  ];

  // ===============================
  // == CHART ======================
  // ===============================

  const TORs = useMemo(() => getAmountsArray(chartDatasets, 'totalAmountReceived'), [chartDatasets]);
  const TOAs = useMemo(() => getAmountsArray(chartDatasets, 'totalOriginalAmount'), [chartDatasets]);

  const chartData = useMemo(
    () => createChartDataset(chartDatasets, TORs, TOAs, i18n.language as Locales),
    [chartDatasets, TOAs, i18n.language]
  );

  const onRequestDeactivate = () => {
    UserService.requestDeactivate()
      .then(() => {
        setSummaryData({
          isShown: true,
          isSuccess: true,
          title: 'pages.investors.view.deactivateSuccess.title',
          subtitle: 'pages.investors.view.deactivateSuccess.subtitle'
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

  useEffect(() => {
    if (id) {
      const periodCategory = chartCategory === chartCategories.period ? PeriodType.interval : PeriodType.month;

      const isInterval = periodCategory === PeriodType.interval;

      const periodQuery = {
        from: periodRange![0],
        to: periodRange![1]
      };

      const query: Query = {
        periodType: periodCategory.toString(),
        ...(isInterval ? periodQuery : {})
      };

      InvestorService.getOverview(id, createQueryString(query))
        .then(res => {
          const { data } = res;

          const {
            totalRecievedAmount,
            totalOriginalAmount,
            products,
            transactions,
            chartData: chartInfo,
          } = data as InvestorOverview;

          const sortedProducts = products
            .sort((curr, next) => getProductTotalAmount(next) - getProductTotalAmount(curr))
            .slice(0, 5);

          setChartDatasets(chartInfo);

          setRecievedAmount(totalRecievedAmount);

          setOriginalAmount(totalOriginalAmount);

          setTopProducts(createProductRows(sortedProducts));

          setLastTransactions(createTransactionRows(transactions, id!));
        })
        .catch(err => {
          console.log(err);
          setIsFetchedWithError(true);
        })
        .finally(() => {
          setProductsFetching(false);
          setTransactionsFetching(false);
          setIsPortfolioFetching(false);
        });
    }
  }, [id, chartCategory, periodRange]);

  useEffect(() => {
    setAnnualizedYield(getAnnullizedYield(originalAmount, recievedAmount));
  }, [recievedAmount, originalAmount]);

  useEffect(() => {
    [topProductsRef, lastTransactionsRef, newsRef].forEach(ref => {
      const observer = new IntersectionObserver(observerCallback, observerOptions);
      if (ref.current) observer.observe(ref.current);

      return () => {
        if (topProductsRef.current) observer.unobserve(topProductsRef.current);
      };
    });
  }, [
    topProductsRef,
    lastTransactionsRef,
    newsRef,
    observerOptions
  ]);

  useEffect(() => {
    if (news?.length) return;

    if (isNewsVisible) {
      setNews(mockNews);
      setNewsFetching(false);
    }
  }, [isNewsVisible, news]);

  useEffect(() => {
    setChartData({ originalAmount: TOAs });
  }, [TOAs]);


  return {
    t,
    i18n,
    width,
    portfolioSummaryList,
    topProductsTableHeader,
    topProducts,
    isProductsFetching,
    lastTransactionsTableHeader,
    lastTransactions,
    isTransactionsFetching,
    onViewClick,
    onViewNewsClick,
    news,
    isNewsFetching,
    topProductsRef,
    lastTransactionsRef,
    newsRef,
    chartData,
    tooltips,
    isFetchedWithError,
    isPortfolioFetching,
    onChartTabChange,
    name,
    chartCategory,
    onPeriodRangeChange,
    periodRange,
    onRequestDeactivate,
    showDeactivateFail,
    onFailClose
  };
};
