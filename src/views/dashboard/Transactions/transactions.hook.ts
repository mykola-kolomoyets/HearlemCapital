/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Label, Roles, Status } from "../../../../../shared/types/common";
import { Query } from "../../../../../shared/types/response";
import { CreateTransactonResponse, TransactionStatus } from "../../../../../shared/types/transaction";

import TransactionService from "../../../services/TransactionService";
import UserContext from "../../../store/contexts/user-context";
import { capitalize, createQueryString, delay, translate } from "../../../utils/fn";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import Validation from "./CreateTransactionForm/validation";

import { theadData, limitStep, createTransactionsRows, rolesForCreate, centeredColumns } from "./transactions.constants";


type TransactionsCategories = {
  [key in TransactionStatus]: number;
} & { all: number };

type TransactionsTabs = {
  [key in keyof TransactionsCategories]: Label
};

const initialCategories = Object.keys(TransactionStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [capitalize(curr)]: 0 }), {}) as TransactionsCategories;

const transactionsTabs: TransactionsTabs = {
  Processing: {
    value: 'Processing',
    label: 'Processing'
  },
  Processed: {
    value: 'Processed',
    label: 'Processed'
  },
  Failed: {
    value: 'Failed',
    label: 'Failed'
  },
  Rejected: {
    value: 'Rejected',
    label: 'Rejected'
  },
  all: {
    value: 'all',
    label: 'All'
  }
};

export const useTransactions = () => {
  const { data: { role } } = UserContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [tableHeader, setTableHeader] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [transactions, setTransactions] = useState<CreateTransactonResponse[]>([]);
  const [selectedTab, setSelectedTab] = useState<Label>(transactionsTabs.all);

  const [transactionRows, setTransactionRows] = useState<Row[]>([]);

  const [transactionsCategories, setTransactionsCategories] = useState<TransactionsCategories>(initialCategories);

  const { t, i18n } = useTranslation();

  const centeredTransactionsColumns = useMemo(() => role && centeredColumns[role], [role]);

  const onToggleForm = () => {
    Validation.reset();
    setShowForm(!showForm);
  };

  const onTabChange = (selected: string) => {
    setSelectedTab(getCurrentTab(transactionsTabs, selected));
    setSkip(0);
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

  const updateTransactionsList = async (status: Label) => {
    setIsFetching(true);

    const query: Query = {
      skip,
      limit: limitStep,
      ...(selectedTab.value === transactionsTabs.all.value ? {} : { status: status.value })
    };

    await TransactionService.getList(createQueryString(query))
    .then((res) => {
      const { data, count, totals } = res.data;

      const rows: Row[] = createTransactionsRows(data, role);

      setTransactions(data);
      setTransactionRows(rows);

      const totalTransactions = totals?.reduce((acc, curr) => acc + curr.count, 0)!;

      setTotal(count);

      const updatedCategories = totals?.reduce(
        (acc, curr) => {
          return {
            ...acc,
            [curr.label as TransactionStatus]: curr.count,
            all: totalTransactions
          };
        }, initialCategories
      )!;

      setTransactionsCategories(updatedCategories);
    })
    .finally(() => setIsFetching(false));
  };

  useEffect(() => setTableHeader(translate(theadData(role))), [role, i18n.language]);

  useEffect(() => {
    if (!showForm && role) {
      setSelectedTab(transactionsTabs.all);
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm && role) {
      if (selectedTab.value === transactionsTabs.all.value) {
        setShowFromCount(skip + 1);
        updateTransactionsList(transactionsTabs.all);
        return;
      }

      updateTransactionsList(selectedTab);

      setShowFromCount(1);
    }
  }, [selectedTab, skip, role]);

  useEffect(() => {
    setTransactionRows(createTransactionsRows(transactions, role));
  }, [transactions, i18n.language]);

  return {
    t,
    tableHead: tableHeader,
    onToggleForm,
    showForm,
    transactionRows,
    isFetching,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    transactionsCategories,
    selectedTab,
    onTabChange,
    showFromCount,
    isCreateAllowed: rolesForCreate.includes(role),
    centeredTransactionsColumns
  };
};
