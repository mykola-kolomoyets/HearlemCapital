import React, { Fragment, lazy } from 'react';

import { hoc } from '../../../../utils';
import { Button, Table, Pagination, Popup } from '../../../components/UI';

import { Breadcrumps } from '../../../components/UI/Breadcrumps';
import { ButtonView } from '../../../components/UI/Button/button.props';
import { Heading } from '../../../components/UI/Heading';
import { HorizontalStackedBar } from '../../../components/UI/HorizontalStackedBar';
import { List } from '../../../components/UI/List';
import { Section } from '../../../components/UI/Section';
import { Spinner } from '../../../components/UI/Spinner';
import RejectComplianceForm from '../../Overview/ComplianceOverview/RejectComplianceForm';
import { Roles } from './../../../../../../shared/types/common';
import ConfirmDeleteUser from './ConfirmDeleteUser';

import { useInvestorView } from './investor-view.hook';

const CreateInvestorForm = lazy(() => import("../CreateInvestorForm"));

import './investor-view.scss';

const InvestorView = hoc(useInvestorView, ({
  t,
  width,
  role,
  isFetching,
  breadcrumps,
  details,
  summary,
  holdingsRows,
  transactionsRows,
  holdingsTHeader,
  transactionsTHeader,
  holdingsChartData,
  complianceLogTableHeader,
  complianceLog,
  showEditForm,
  onToggleEditForm,
  investorData,
  investorId,
  onRequestDeactivate,
  isComplianceLogFetching,
  showFromCountComplianceLog,
  skipComplianceLog,
  limitComplianceLog,
  totalComplianceLog,
  goNextPageComplianceLog,
  goPrevPageComplianceLog,
  showRejectFormComplianceLog,
  onCloseRejectFormComplianceLog,
  callbackComplianceLogAction,
  isInvestorActive,
  onToggleConfirmDeleteUser,
  showDeleteUserConfirm,
  onAfterDeleteCallback
}) => (
  <section className="investor-view">
    <Popup visible={showRejectFormComplianceLog} onClose={onCloseRejectFormComplianceLog}>
      <RejectComplianceForm callback={callbackComplianceLogAction} />
    </Popup>

    <Popup visible={showDeleteUserConfirm} onClose={onToggleConfirmDeleteUser}>
      <ConfirmDeleteUser id={investorId} email={investorData.email!} callback={onAfterDeleteCallback} />
    </Popup>

    <div className="content-wrapper">
      <div className="content">
        {isFetching ? <Spinner /> : (
          <Fragment>
            <section className="content__header">
              <Breadcrumps items={breadcrumps} />
                {  Roles.compliance !== role &&
                  <section className="content__header-buttons">

                    <Button
                      view={ButtonView.redLayout}
                      onClick={isInvestorActive ? onRequestDeactivate : onToggleConfirmDeleteUser}
                      disabled={isInvestorActive && investorData.isRequestDeactivate}
                    >
                      {t(`pages.investors.view.${isInvestorActive ? 'deactivate' : 'delete'}`)}
                    </Button>

                    <Button
                      view={ButtonView.unfilled}
                      onClick={onToggleEditForm}
                    >
                      {t("pages.investors.view.editDetails.title")}
                    </Button>
                  </section>
                }


                { showEditForm &&
                  <CreateInvestorForm
                    visible={showEditForm}
                    editData={{
                      initialValues: { ...investorData, status: undefined },
                      id: investorId
                    }}
                    onClose={onToggleEditForm}
                  />
                }

            </section>

            <section className='investor-view__content'>
              <article className='investor-view__right'>
                <Section className='investor-view__details'>
                  <Heading view='secondary' active>
                    {t('pages.investors.view.details.title')}
                  </Heading>

                  <List
                    type='vertical'
                    items={details}
                  />
                </Section>
              </article>

              <article className='investor-view__left'>
                <Section className='investor-view__section investor-view__compliance-log'>
                  <Heading className='mock' view='secondary' active>
                    {t('pages.admin.overview.complianceLog.title')}
                  </Heading>

                  <div className='overview__compliance-log-content'>
                    {isComplianceLogFetching ? (
                      <Spinner />
                    ) : complianceLog?.length ? (
                      <Fragment>
                        <Table
                          theadData={complianceLogTableHeader}
                          tbodyData={complianceLog}
                          sortedFields={{ indexes: [0] }}
                          approveOptions={
                            {
                              callback: callbackComplianceLogAction
                            }
                          }
                          emptyState={t('pages.admin.overview.complianceLog.table.empty')}
                        />

                        <Pagination
                          from={showFromCountComplianceLog}
                          to={skipComplianceLog + limitComplianceLog}
                          total={totalComplianceLog}
                          delta={limitComplianceLog}
                          showNext={goNextPageComplianceLog}
                          showPrev={goPrevPageComplianceLog}
                          disabledNext={complianceLog?.length != limitComplianceLog}
                        />
                      </Fragment>
                    ) : (
                      <Heading view="accent" active>
                        {t('pages.admin.overview.complianceLog.table.empty')}
                      </Heading>
                    )}
                  </div>
                </Section>

                <Section className=' investor-view__section investor-view__summary'>
                  <Heading view='secondary' active>
                    {t('pages.investors.view.summary.title')}
                  </Heading>

                  <List
                    type={width! > 620 ? 'horizontal' : 'vertical'}
                    items={summary}
                  />
                </Section>

                <Section className='investor-view__section investor-view__holdings'>
                  <Heading view='secondary' active>
                    {t('pages.investors.view.holdings.title')}
                  </Heading>

                  {holdingsChartData?.length ? (
                    <HorizontalStackedBar
                      data={holdingsChartData}
                      showPercents
                      showAmount={false}
                    />
                  ) : null}

                  <div className="product-view__table">
                    <Table
                      theadData={holdingsTHeader}
                      tbodyData={holdingsRows}
                      centeredColumns={[2, 3, 4]}
                      emptyState={t('pages.investors.view.holdings.table.empty')}
                    />
                  </div>
                </Section>

                <Section className=' investor-view__section investor-view__transactions'>
                  <Heading view='secondary' active>
                    {t('pages.investors.view.transactions.title')}
                  </Heading>

                  <div className="product-view__table">
                    <Table
                      theadData={transactionsTHeader}
                      tbodyData={transactionsRows}
                      sortedFields={{ indexes: [3] }}
                      centeredColumns={[3]}
                      emptyState={t('pages.investors.view.transactions.table.empty')}
                    />
                  </div>
                </Section>
              </article>
            </section>
          </Fragment>
        )}
      </div>
    </div>
  </section>
));

export default InvestorView;
