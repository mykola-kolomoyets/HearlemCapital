import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import InvestorService from "../../../services/InvestorService";

import ChartContext from "../../../store/contexts/chart-context";
import UserContext from "../../../store/contexts/user-context";

import { Holding } from "../../../../../shared/types/holding";
import { InvestorChartData, InvestorIntervalChartData, InvestorPortfolio } from "../../../../../shared/types/investor";

import { useWindowSize } from "../../components/Hooks/useWindowSize";
import { HorizontalStackedBarData } from "../../components/UI/HorizontalStackedBar";
import { ListItemProps } from "../../components/UI/List/ListItem";
import { Row } from "../../components/UI/Table";

import { createChartDataset, defaultChartPeriodRange, getAmountsArray } from "../Overview/InvestorOverview/overview.constants";

import {
  colors,
  createHoldingsRows,
  getAnnullizedYield,
  tHeader,
  tooltipLabels,
} from "./portfolio.constants";
import { Label, ObjWithKeys, PeriodType } from "../../../../../shared/types/common";
import { createQueryString, sortDate, translate } from "../../../utils";
import { Query } from "../../../../../shared/types/response";
import { Locales } from "../../../localization/models";
import { getChartCategories } from "../Overview/InvestorOverview/PortfolioSummary/portfolio-summary.constants";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";
import { SortingDirection } from "../../components/UI/Table/Table.utils";


const usePortfolio = () => {
  const { data: { id } } = UserContext.useContext();
  const { setData: setChartData } = ChartContext.useContext();

  const { t, i18n } = useTranslation();

  const { width } = useWindowSize();

  const chartCategories: ObjWithKeys<Label> = useMemo(() => getChartCategories(), [i18n.language]);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  const [chartCategory, setChartCategory] = useState<Label>(chartCategories.yearToDate);


  const [periodRange, setPeriodRange] = useState<string[]>(defaultChartPeriodRange);

  const [recievedAmount, setRecievedAmount] = useState<number>(0);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [annualizedYield, setAnnualizedYield] = useState<number>(0);

  const [isPortfolioFetching, setIsPortfolioFetching] = useState(true);
  const [isFetchedWithError, setIsFetchedWithError] = useState(false);

  const tableHeader = translate(tHeader);
  const tooltips = translate(tooltipLabels);

  const [chartDatasets, setChartDatasets] = useState<InvestorChartData[] | InvestorIntervalChartData[]>([]);

  const onChartTabChange = (selected: string) => setChartCategory(getCurrentTab(chartCategories, selected));

  const onPeriodRangeChange = (range: string[]) => {
    setPeriodRange(range ?? defaultChartPeriodRange);
  };

  const portfolioList: ListItemProps[] = [
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

  const tableBody: Row[] = useMemo(() => createHoldingsRows(holdings, originalAmount), [holdings, originalAmount]);

  const dataForChart: HorizontalStackedBarData[] = useMemo(() => {
    const body = tableBody
      ? tableBody.sort((curr, next) =>
          sortDate(
            curr[tableBody.length - 3]?.value,
            next[tableBody.length - 3]?.value,
            SortingDirection.descending
          )
        )
      : tableBody;

    return body.map((holding, index) => ({
      data: {
        label: holding[0].value,
        amount: isNaN(Number(holding[3].value)) ? 0 : Number(holding[3].value),
        barColor: colors[index],
      },
    }));
  }, [tableBody, originalAmount]);

  const TORs = useMemo(() => getAmountsArray(chartDatasets, 'totalAmountReceived'), [chartDatasets]);
  const TOAs = useMemo(() => getAmountsArray(chartDatasets, 'totalOriginalAmount'), [chartDatasets]);

  const chartData = useMemo(
    () => createChartDataset(chartDatasets, TORs, TOAs, i18n.language as Locales),
    [chartDatasets, TOAs, i18n.language]
  );

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

      InvestorService.getPortfolio(id, createQueryString(query))
        .then((res) => {
          const { data } = res;

          const {
            holdings: holdingsData,
            totalRecievedAmount,
            totalOriginalAmount,
            chartData: chartInfo
          } = data as InvestorPortfolio;

          setChartDatasets(chartInfo);

          setHoldings(holdingsData);

          setRecievedAmount(totalRecievedAmount);

          setOriginalAmount(totalOriginalAmount);
        })
        .catch((err) => {
          console.log(err);
          setIsFetchedWithError(true);
        })
        .finally(() => setIsPortfolioFetching(false));
    }
  }, [id, chartCategory, periodRange, i18n.language]);

  useEffect(() => {
    setAnnualizedYield(getAnnullizedYield(originalAmount, recievedAmount));
  }, [recievedAmount, originalAmount]);

  useEffect(() => {
    setChartData({ originalAmount: TOAs });
  }, [TOAs]);

  return {
    t,
    width,
    chartData,
    portfolioList,
    dataForChart,
    tableBody,
    tableHeader,
    tooltips,
    isPortfolioFetching,
    isFetchedWithError,
    onChartTabChange,
    chartCategory,
    onPeriodRangeChange,
    periodRange
  };
};

export { usePortfolio };
