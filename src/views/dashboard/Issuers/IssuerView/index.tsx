import React, { Fragment, lazy } from 'react';

import { hoc } from '../../../../utils';
import { Button, Pagination, Popup, Table } from '../../../components/UI';

import { Breadcrumps } from '../../../components/UI/Breadcrumps';
import { ButtonView } from '../../../components/UI/Button/button.props';
import { Heading } from '../../../components/UI/Heading';
import { List } from '../../../components/UI/List';
import { Section } from '../../../components/UI/Section';
import { Spinner } from '../../../components/UI/Spinner';
import ConfirmDeleteUser from '../../Investors/InvestorView/ConfirmDeleteUser';
import RejectComplianceForm from '../../Overview/ComplianceOverview/RejectComplianceForm';

import { Roles } from './../../../../../../shared/types/common';

import { useIssuerView } from './issuer-view.hook';

import './issuer-view.scss';

const CreateIssuerForm = lazy(() => import("../CreateIssuerForm"));


const IssuerView = hoc(useIssuerView, ({
  t,
  width,
  role,
  isFetching,
  breadcrumps,
  details,
  summary,
  productsRows,
  transactionsRows,
  productTHeader,
  transactionsTHeader,
  complianceLogTableHeader,
  complianceLog,
  showEditForm,
  onToggleEditForm,
  issuerData,
  issuerId,
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
  showDeleteUserConfirm,
  isIssuerActive,
  onToggleConfirmDeleteUser,
  onRequestDeactivate,
  onAfterDeleteUser
}) => (

  <section className="issuer-view">
    <Popup visible={showRejectFormComplianceLog} onClose={onCloseRejectFormComplianceLog}>
      <RejectComplianceForm callback={callbackComplianceLogAction} />
    </Popup>

    <Popup visible={showDeleteUserConfirm} onClose={onToggleConfirmDeleteUser}>
      <ConfirmDeleteUser id={issuerId} email={issuerData.email!} callback={onAfterDeleteUser} />
    </Popup>

    <div className="content-wrapper">
      <div className="content">
        {isFetching ? <Spinner /> : (
          <Fragment>
            <section className="content__header">
              <Breadcrumps items={breadcrumps} />

              {Roles.compliance !== role &&
                <Button
                  view={ButtonView.redLayout}
                  onClick={isIssuerActive ? onRequestDeactivate : onToggleConfirmDeleteUser}
                  disabled={isIssuerActive && issuerData.isRequestDeactivate}
                >
                  {t(`pages.issuer.view.${isIssuerActive ? 'deactivate' : 'delete'}`)}
                </Button>
              }

              {showEditForm && (
                <CreateIssuerForm
                  visible={showEditForm}
                  editData={{
                    initialValues: issuerData,
                    id: issuerId
                  }}
                  onClose={onToggleEditForm}
                />
              )}
            </section>

            <section className='issuer-view__content'>
              <article className='issuer-view__right'>
                <Section className='issuer-view__details'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.details.title')}
                  </Heading>

                  <List
                    type='vertical'
                    items={details}
                  />
                </Section>
              </article>

              <article className='issuer-view__left'>
                <Section className='issuer-view__section issuer-view__compliance-log'>
                  <Heading className='mock' view='secondary' active >
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

                <Section className=' issuer-view__section issuer-view__summary'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.summary.title')}
                  </Heading>

                  <List
                    type={width! > 620 ? 'horizontal' : 'vertical'}
                    items={summary}
                  />
                </Section>

                <Section className=' issuer-view__section issuer-view__products'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.products.title')}
                  </Heading>

                  <div className="product-view__table">
                    <Table
                      theadData={productTHeader}
                      tbodyData={productsRows}
                      sortedFields={{ indexes: [0] }}
                      centeredColumns={[2, 4]}
                      emptyState={t('pages.issuer.view.products.table.empty')}
                    />
                  </div>
                </Section>

                <Section className=' issuer-view__section issuer-view__transactions'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.transactions.title')}
                  </Heading>

                  <div className="product-view__table">
                    <Table
                      theadData={transactionsTHeader}
                      tbodyData={transactionsRows}
                      sortedFields={{ indexes: [4] }}
                      centeredColumns={[4]}
                      emptyState={t('pages.issuer.view.transactions.table.empty')}
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

export default IssuerView;
