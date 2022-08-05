import React, { Fragment, lazy } from "react";

import { hoc } from "../../../../utils";

import { Popup } from "../../../components/UI";
import { Heading } from "../../../components/UI/Heading";
import ComplianceLog from "../../Compliances";

import { useOverview } from "./overview.hook";
import "./overview.scss";

const RejectComplianceForm = lazy(() => import('./RejectComplianceForm'));

const AdminOverview = hoc(
  useOverview,
  ({
    t,
    name,
    showRejectForm,
    onCloseRejectForm
  }) => {
    return (
      <Fragment>
        <Popup visible={showRejectForm} onClose={onCloseRejectForm}>
          <RejectComplianceForm />
        </Popup>

        <div className="content">

          <section className="content__header">
            <Heading view="main" active>
              {t('pages.admin.overview.title')} {name}
            </Heading>

          </section>

          <ComplianceLog withTitle={false} limitStep={20} />
        </div>
      </Fragment>
    );
  }
);

export default AdminOverview;
