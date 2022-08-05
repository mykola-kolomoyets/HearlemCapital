import React, { Fragment } from 'react';
import { capitalize } from '../../../utils/fn';

import { hoc } from '../../../utils/hoc';
import { Pagination, Popup } from '../../components/UI';

import { Heading } from '../../components/UI/Heading';
import { Section } from '../../components/UI/Section';
import { Spinner } from '../../components/UI/Spinner';
import Table from '../../components/UI/Table';
import Tabs from '../../components/UI/Tabs';
import { Tab } from '../../components/UI/Tabs/Tab';

import RejectComplianceForm from '../Overview/ComplianceOverview/RejectComplianceForm';

import { useComplianceLog } from './compliances.hook';


type TypeMappingComplianceStatus = {
  [key: string]: string;
};

const MappingComplianceStatus: TypeMappingComplianceStatus = {
  Initiated: "pages.admin.overview.complianceLog.complianceStatus.initiated",
  Accepted: "pages.admin.overview.complianceLog.complianceStatus.accepted",
  Rejected: "pages.admin.overview.complianceLog.complianceStatus.rejected",
  all: "pages.admin.overview.complianceLog.complianceStatus.all",
};



const ComplianceLog = hoc(useComplianceLog, ({
  t,
  withTitle,
  complianceLogRows,
  isComplianceLogFetching,
  complianceLogTableHeader,
  showRejectForm,
  onCloseRejectForm,
  filter,
  skip,
  limitStep,
  total,
  goNextPage,
  goPrevPage,
  onTabChange,
  selectedTab,
  complianceCategories,
  showFromCount
}) => (
  <Fragment>
    <Popup visible={showRejectForm} onClose={onCloseRejectForm}>
      <RejectComplianceForm skip={skip} limit={limitStep} filter={filter} />
    </Popup>

    <div className="content">
      {withTitle && (
        <div className="content__header">
          <Heading
            view="main"
            active
          >
            {t("pages.complianceLog.title")}
          </Heading>

        </div>
      )}

      <section className="admin-overview__content">
        <Section className=' section admin-overview__section admin-overview__compliance-log'>

          <div className='overview__compliance-log-content' >
            {isComplianceLogFetching ? (
              <Spinner />
            ) : (
              <Tabs selectedId={selectedTab} onChange={onTabChange}>
                <Fragment>
                  {Object.entries(complianceCategories).map((item) => (
                    <Tab
                      key={item[0]}
                      title={capitalize(t(MappingComplianceStatus[item[0]]))}
                      id={item[0]}
                      rightAddons={item[1]}
                    >
                      {complianceLogRows?.length ? (
                        <Fragment>
                          <Table
                            theadData={complianceLogTableHeader}
                            tbodyData={complianceLogRows}
                            sortedFields={{ indexes: [0] }}
                            approveOptions={
                              {
                                skip,
                                limit: limitStep,
                                filter
                              }
                            }
                            emptyState={t('pages.admin.overview.complianceLog.table.empty')}
                          />

                          <Pagination
                            from={showFromCount}
                            to={skip + limitStep}
                            total={total}
                            delta={limitStep}
                            showNext={goNextPage}
                            showPrev={goPrevPage}
                            disabledNext={complianceLogRows?.length != limitStep}
                          />
                        </Fragment>
                      ) : (
                        <Heading view="accent" active>
                          {t('pages.admin.overview.complianceLog.table.empty')}
                        </Heading>
                      )}
                    </Tab>
                  ))}
                </Fragment>
              </Tabs>
            )}
          </div>
        </Section>
      </section>
    </div >
  </Fragment>
));

export default ComplianceLog;
