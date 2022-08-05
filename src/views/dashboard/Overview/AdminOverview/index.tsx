import React, { Fragment } from "react";

import { hoc } from "../../../../utils";

import { InvestorsIcon, ProductsIcon, TransactionsIcon, CircleOutlineIcon } from "../../../components/icons";
import { Button, Table } from "../../../components/UI";
import { ButtonView } from "../../../components/UI/Button/button.props";
import { Heading } from "../../../components/UI/Heading";
import { BarLabel } from "../../../components/UI/HorizontalStackedBar/BarLabel";
import { List } from "../../../components/UI/List";
import { Section } from "../../../components/UI/Section";
import { Spinner } from "../../../components/UI/Spinner";
import VerticalBarChart from "../../../components/UI/VerticalBarChart";

import { useOverview } from "./overview.hook";
import "./overview.scss";

const AdminOverview = hoc(
  useOverview,
  ({
    t,
    name,
    width,
    platformOverview,
    platformOverviewPercents,
    pendingProductsTableHeader,
    pendingInvestorsTableHeader,
    pendingTransactionsTableHeader,
    complianceLogTableHeader,
    pendingInvestors,
    pendingProducts,
    pendingTransactions,
    complianceLog,
    isProductsFetching,
    isTransactionsFetching,
    isInvestorsFetching,
    isComplianceLogFetching,
    onViewClick,
    pendingProductsRef,
    pendingTransactionsRef,
    pendingInvestorsRef,
    complianceLogRef,
    chartData,
    tooltips,
    transactionVolumeLabelData
  }) => (
    <Fragment>
      <div className="content">

        <section className="content__header">
          <Heading view="main" active>
            {t('pages.admin.overview.title')} {name}
          </Heading>

        </section>

          <section className="admin-overview__content">
            <Section className='admin-overview__section admin-overview__overview'>
              <Heading view="secondary" active>
                {t('pages.admin.overview.platformOverview.title')}
              </Heading>

              <List
                items={platformOverview}
                withBadges
                badgesValues={platformOverviewPercents}
                type={width! > 620 ? "horizontal" : "vertical"}
              />
            </Section>

            <Section className="admin-overview__section admin-overview__volume">
              <Heading view="secondary" active>
                {t('pages.admin.overview.transactionVolume')}
              </Heading>

              <section className='admin-overview__chart-labels'>
                {transactionVolumeLabelData.map(item => (
                  <BarLabel
                    key={item.additionalStyle?.labelColor}
                    item={item.item}
                    wrapperClassName='admin-overview__chart-label'
                    additionalStyle={item.additionalStyle}
                    label={t(item.item.data.label)}
                  />
                ))}
              </section>

            {chartData?.isShow && (
              <section>
                <VerticalBarChart chartData={chartData.values} tooltipsLabels={tooltips} />
              </section>
            )}

          </Section>

          <Section className='admin-overview__section admin-overview__pending-investors'>
            <Heading view='secondary' active>
              {pendingInvestors?.length || ''} {t('pages.admin.overview.pendingInvestors.title')}
            </Heading>

            <div className='overview__investors-content' ref={pendingInvestorsRef}>
              {isInvestorsFetching ? (
                <Spinner />
              ) : (
                <Table
                  theadData={pendingInvestorsTableHeader}
                  tbodyData={pendingInvestors}
                  sortedFields={{ indexes: [0] }}
                  emptyState={t('pages.admin.overview.pendingInvestors.table.empty')}
                />
              )}
            </div>

            <section className="admin-overview__section-footer">
              <Button
                view={ButtonView.unfilled}
                onClick={() => onViewClick('investors')}
              >
                <InvestorsIcon width="16px" height="16px" />

                {t('pages.admin.overview.pendingInvestors.viewAll')}
              </Button>
            </section>
          </Section>

          <Section className='admin-overview__section admin-overview__pending-investors'>
            <Heading view='secondary' active>
              {pendingProducts?.length || ''} {t('pages.admin.overview.pendingProducts.title')}
            </Heading>

            <div className='overview__products-content' ref={pendingProductsRef}>
              {isProductsFetching ? (
                <Spinner />
              ) : (
                <Table
                  theadData={pendingProductsTableHeader}
                  tbodyData={pendingProducts}
                  sortedFields={{ indexes: [0] }}
                  centeredColumns={[3, 5]}
                  emptyState={t('pages.admin.overview.pendingProducts.table.empty')}
                />
              )}
            </div>

            <section className="admin-overview__section-footer">
              <Button
                view={ButtonView.unfilled}
                onClick={() => onViewClick('products')}
              >
                <ProductsIcon width="16px" height="16px" />

                {t('pages.admin.overview.pendingProducts.viewAll')}
              </Button>
            </section>
          </Section>

          <Section className='admin-overview__section admin-overview__pending-investors'>
            <Heading view='secondary' active>
              {pendingTransactions?.length || ''} {t('pages.admin.overview.pendingTransactions.title')}
            </Heading>

            <div className='overview__transactions-content' ref={pendingTransactionsRef}>
              {isTransactionsFetching ? (
                <Spinner />
              ) : (
                <Table
                  theadData={pendingTransactionsTableHeader}
                  tbodyData={pendingTransactions}
                  sortedFields={{ indexes: [4] }}
                  centeredColumns={[4]}
                  emptyState={t('pages.admin.overview.pendingTransactions.table.empty')}
                />
              )}
            </div>

            <section className="admin-overview__section-footer">
              <Button
                view={ButtonView.unfilled}
                onClick={() => onViewClick('transactions')}
              >
                <TransactionsIcon width="16px" height="16px" />

                {t('pages.admin.overview.pendingTransactions.viewAll')}
              </Button>
            </section>
          </Section>

          <Section className='admin-overview__section admin-overview__compliance-log'>
            <Heading view='secondary' active>
              {t('pages.admin.overview.complianceLog.title')}
            </Heading>

            <div className='overview__compliance-log-content' ref={complianceLogRef}>
              {isComplianceLogFetching ? (
                <Spinner />
              ) : (
                <Table
                  theadData={complianceLogTableHeader}
                  tbodyData={complianceLog}
                  sortedFields={{ indexes: [0] }}
                  emptyState={t('pages.admin.overview.complianceLog.table.empty')}
                />
              )}
            </div>

            <section className="admin-overview__section-footer">
              <Button
                view={ButtonView.unfilled}
                onClick={() => onViewClick('compliances')}
              >
                <CircleOutlineIcon />

                {t('pages.admin.overview.complianceLog.viewAll')}
              </Button>
            </section>
          </Section>
        </section>
      </div>
    </Fragment>
  ));

export default AdminOverview;
