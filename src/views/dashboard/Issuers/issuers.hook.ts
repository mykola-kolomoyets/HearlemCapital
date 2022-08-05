/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AccountStatus, Roles } from "../../../../../shared/types/common";
import { Issuer } from "../../../../../shared/types/issuer";
import { Query } from "../../../../../shared/types/response";

import IssuerService from "../../../services/IssuerService";
import UserContext from "../../../store/contexts/user-context";

import { createQueryString, delay, getLastElement, translate } from "../../../utils/fn";

import { Row } from "../../components/UI/Table";

// import Validation from "./CreateIssuerForm/validation";

import { theadData, limitStep, createIssuersRows, rolesForCreate } from "./issuers.constants";

type IssuerCategories = {
  [key in AccountStatus]: number;
} & { all: number };

const initialCategories = Object.keys(AccountStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [curr]: 0 }), {}) as IssuerCategories;

export const useTransactions = () => {
  const { data: { role } } = UserContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [tableHeader, setTableHeader] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [issuers, setIssuers] = useState<Issuer[]>([]);

  const [selectedTab, setSelectedTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const [issuersRows, setIssuersRows] = useState<Row[]>([]);

  const [issuersCategories, setIssuersCategories] =
    useState<IssuerCategories>(initialCategories);

  const { t, i18n } = useTranslation();

  const isCreateAllowed = useMemo(() => rolesForCreate.includes(role), [role, rolesForCreate]);

  const onToggleForm = () => {
    // Validation.reset();
    setShowForm(!showForm);
  };

  const onTabChange = (selected: string) => {
    setSelectedTab(selected);
  };

  const getIssuerList = () => {
    const search = searchValue.trim();
    setIsFetching(true);

    const query: Query = {
      skip,
      limit: limitStep,
      ...(search ? { name: search } : {})
    };

    IssuerService.getList(createQueryString(query))
      .then((res) => {
        const response: Issuer[] = res.data.data;
        const count = res.data.count;

        const rows: Row[] = createIssuersRows(response);
        setIssuers(response);
        setTotal(count);
        setIssuersRows(rows);

        let issuersCategoriesData = rows.reduce(
          (acc: any, curr: Row) => {
            return {
              ...acc,
              [getLastElement(curr).value.toLowerCase()]: acc[getLastElement(curr).value.toLowerCase()] + 1,
              all: res.data.count
            };
          }, initialCategories
        );

        setIssuersCategories(issuersCategoriesData);
      })
      .finally(() => setIsFetching(false));
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
    setIssuersCategories({ ...initialCategories });

    if (!showForm) {
      delay(() => {
        getIssuerList();
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
      setTotal(issuersCategories.all);
      return setIssuersRows(createIssuersRows(issuers));
    }

    const filteredTransactions = issuers.filter(
      (issuer) => issuer?.status?.toLowerCase() === selectedTab
    );

    setIssuersRows(createIssuersRows(filteredTransactions));
    setTotal(filteredTransactions.length);
    setShowFromCount(1);
  }, [selectedTab, i18n.language]);

  return {
    t,
    tableHead: tableHeader,
    onToggleForm,
    showForm,
    issuersRows,
    isFetching,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    issuersCategories,
    selectedTab,
    onTabChange,
    showFromCount,
    searchValue,
    setSearchValue,
    isCreateAllowed
  };
};
