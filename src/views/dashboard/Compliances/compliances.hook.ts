import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ComplianceStatus, Label } from "../../../../../shared/types/common";
import { ComplianceCategory } from "../../../../../shared/types/compliance";
import { Query } from "../../../../../shared/types/response";

import AdminService from "../../../services/AdminService";

import ComplianceContext from "../../../store/contexts/compliance-log-context";
import UserContext from "../../../store/contexts/user-context";

import { createQueryString, translate } from "../../../utils/fn";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import {
  complianceLogTHeader,
  createComplianceLogRows,
  limitStep as defaultLimitStep,
} from "./compliances.constants";

export type ComplianceCategories = ComplianceCategory & { all: number };


type ComplianceTabs = {
  [key in keyof ComplianceCategories]: Label
};

const initialCategories = Object.keys(ComplianceStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [curr]: 0 }), {}) as ComplianceCategories;

const complianceTabs: ComplianceTabs = {
  Initiated: {
    value: 'Initiated',
    label: 'Initiated',
  },
  Accepted: {
    value: 'Accepted',
    label: 'Accepted',
  },
  Rejected: {
    value: 'Rejected',
    label: 'Rejected',
  },
  all: {
    value: 'all',
    label: 'All',
  }
};

type UseComplianceLogProps = {
  limitStep?: number;
  withTitle?: boolean;
};
const useComplianceLog = ({ limitStep, withTitle = true }: UseComplianceLogProps) => {
  const {
    data: { id },
  } = UserContext.useContext();
  const {
    data: { rejectLogId, logs: compliances },
    setData: setComplianceData,
  } = ComplianceContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({});
  const [showFromCount, setShowFromCount] = useState(1);

  const [complianceLogRows, setComplianceLogRows] = useState<Row[]>([]);

  const [selectedTab, setSelectedTab] =
    useState<Label>(complianceTabs.all);

  const [isComplianceLogFetching, setComplianceLogFetching] = useState(true);

  const [complianceCategories, setComplianceCategories] =
    useState<ComplianceCategories>({ ...initialCategories });

  const { t, i18n } = useTranslation();

  const onCloseRejectForm = () => setComplianceData({ rejectLogId: "" });

  const onTabChange = (selected: string) => {
    setSelectedTab(getCurrentTab(complianceTabs, selected));
    setSkip(0);
  };

  const viewNewPage = (newSkip: number) => {
    setComplianceLogFetching(true);
    setSkip(newSkip);
    setShowFromCount(newSkip + 1);
  };

  const goNextPage = () => {
    const newSkip = skip + (limitStep! || defaultLimitStep);

    if (newSkip > total) return;

    viewNewPage(newSkip);
  };

  const goPrevPage = () => {
    const newSkip = skip - (limitStep! || defaultLimitStep);

    if (newSkip < 0) return;

    viewNewPage(newSkip);
  };

  const complianceLogTableHeader = translate(complianceLogTHeader);

  const updateComplianceList = async (status: Label) => {
    const currentFilter: Query = selectedTab.value === complianceTabs.all.value ? {} : { status: status.value };

    setFilter(currentFilter);
    setComplianceLogFetching(true);

    const query: Query = {
      skip,
      limit: (limitStep! || defaultLimitStep),
      ...currentFilter
    };

    const requestQuery = createQueryString(query);

    await AdminService.getComplianceList(requestQuery)
      .then((res) => {
        const { data, count, totals } = res.data;

        setTotal(count);

        setComplianceData({ logs: data });

        const updatedCategories: ComplianceCategories = totals?.reduce(
          (acc, curr) => {
            return {
              ...acc,
              [curr.label]: curr.count,
              all: acc.all + curr.count,
            };
          },
          initialCategories
        )!;

        setComplianceCategories(updatedCategories);
      })
      .catch((error) => console.log(error))
      .finally(() => setComplianceLogFetching(false));
  };

  useEffect(() => {
    setShowFromCount(skip + 1);
    if (selectedTab.value === complianceTabs.all.value) {
      updateComplianceList(complianceTabs.all);
      return;
    }

    updateComplianceList(selectedTab);
  }, [selectedTab, skip]);

  useEffect(() => {
    setComplianceLogRows(createComplianceLogRows(id, compliances));
  }, [compliances, i18n.language]);

  return {
    t,
    withTitle,
    complianceLogRows,
    isComplianceLogFetching,
    complianceLogTableHeader,
    onCloseRejectForm,
    filter,
    skip,
    total,
    goNextPage,
    goPrevPage,
    onTabChange,
    selectedTab,
    complianceCategories,
    showFromCount,
    showRejectForm: Boolean(rejectLogId),
    limitStep : limitStep || defaultLimitStep
  };
};

export { useComplianceLog };
