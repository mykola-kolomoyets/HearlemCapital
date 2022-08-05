import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Investor } from '../../../../../shared/types/investor';

import { createQueryString, delay, getLastElement, translate } from '../../../utils';
import InvestorService from '../../../services/InvestorService';

import { Row } from '../../components/UI/Table';

import {
  createInvestorsRows,
  initialCategories,
  InvestorsCategories,
  limitStep,
  rolesForCreate,
  theadData
} from './investors.constants';
import UserContext from '../../../store/contexts/user-context';
import { Query } from '../../../../../shared/types/response';

export const useInvestors = () => {
  const { data: { role }  } = UserContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [isFetching, setIsFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const [investors, setInvestors] = useState<Investor[]>([]);

  const [investorRows, setInvestorRows] = useState<Row[]>([]);

  const [selectedTab, setSelectedTab] = useState("all");
  const [investorsCategories, setInvestorsCategories] =
    useState<InvestorsCategories>(initialCategories);

  const { t, i18n } = useTranslation();

  const onToggleForm = () => setShowForm(show => !show);

  const onTabChange = (selected: string) => {
    setSelectedTab(selected);
  };

  const viewNewPage = (newSkip: number) => {
    setIsFetching(true);
    setSkip(newSkip);
    setShowFromCount(newSkip + 1);
  };

  const goNextPage = () => {
    const newSkip = skip + limitStep;

    if (newSkip > total) return;

    viewNewPage(newSkip);
  };

  const goPrevPage = () => {
    const newSkip = skip - limitStep;

    if (newSkip < 0) return;

    viewNewPage(newSkip);
  };

  useEffect(() => setTableHeader(translate(theadData)), [i18n.language]);

  useEffect(() => {
    setSelectedTab("all");
    setInvestorsCategories({ ...initialCategories });

    if (!showForm) {
      delay(() => {
        setIsFetching(true);

        const query: Query = {
          skip,
          limit: limitStep,
          ...(searchValue ? { name: searchValue } : {})
        };

        InvestorService.getList(createQueryString(query))
          .then((res) => {
            const { data, count } = res.data;

            const rows: Row[] = createInvestorsRows(data);

            setInvestors(data);
            setTotal(count);
            setInvestorRows(rows);

            let investorsCaregoriesData = rows.reduce(
              (acc: InvestorsCategories, curr: Row) => ({
                ...acc,
                [getLastElement(curr).value.toLowerCase()]: acc[getLastElement(curr).value.toLowerCase() as keyof InvestorsCategories] + 1,
                all: count
              }), initialCategories
            );

            setInvestorsCategories(investorsCaregoriesData);
          })
          .finally(() => setIsFetching(false));
      }, 500);
    }
  }, [searchValue, showForm, skip]);

  useEffect(() => {
    setSkip(0);
    setShowFromCount(1);
  }, [searchValue]);

  useEffect(() => {
    if (selectedTab === "all") {
      setShowFromCount(skip + 1);
      setTotal(investorsCategories.all);
      return setInvestorRows(createInvestorsRows(investors));
    }

    const filteredTransactions = investors.filter(
      (investor) => investor?.status?.toLowerCase() === selectedTab
    );

    setInvestorRows(createInvestorsRows(filteredTransactions));
    setTotal(filteredTransactions.length);
    setShowFromCount(1);
  }, [selectedTab, i18n.language]);
  return {
    t,
    i18n,
    searchValue,
    setSearchValue,
    investorRows,
    tableHead: tableHeader,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    isFetching,
    showFromCount,
    selectedTab,
    investorsCategories,
    onTabChange,
    showForm,
    onToggleForm,
    isCreateAllowed: rolesForCreate.includes(role)
  };
};
