import { useTranslation } from "react-i18next";

import UserContext from "../../../../store/contexts/user-context";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";

import ComplianceContext from "../../../../store/contexts/compliance-log-context";

export const useOverview = () => {
  const { data: { name } } = UserContext.useContext();
  const {
    data: { rejectLogId },
    setData: setComplianceData
  } = ComplianceContext.useContext();

  const { t, i18n } = useTranslation();

  const { width } = useWindowSize();

  const onCloseRejectForm = () => setComplianceData({ rejectLogId: '' });

  return {
    t,
    i18n,
    name,
    width,
    showRejectForm: Boolean(rejectLogId),
    onCloseRejectForm
  };
};
