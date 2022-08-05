import React from "react";

import { hoc } from "../../../../utils";

import Button from "../../../components/UI/Button";
import { Heading } from "../../../components/UI/Heading";
import { Section } from "../../../components/UI/Section";
import { Spinner } from "../../../components/UI/Spinner";
import Table from "../../../components/UI/Table";
import {
  // NewsIcon,
  ProductsIcon,
  TransactionsIcon,
} from "../../../components/icons";

// import { News } from "../News";

import { useOverview } from "./overview.hook";
import "./overview.scss";
import { PortfolioSummary } from "./PortfolioSummary";
import { ButtonView } from "../../../components/UI/Button/button.props";

const Overview = hoc(
  useOverview,
  ({
    t,
    width,
    portfolioSummaryList,
    topProductsTableHeader,
    topProducts,
    isProductsFetching,
    lastTransactionsTableHeader,
    lastTransactions,
    isTransactionsFetching,
    onViewClick,
    // onViewNewsClick,
    // news,
    // isNewsFetching,
    // newsRef,
    topProductsRef,
    lastTransactionsRef,
    chartData,
    tooltips,
    isFetchedWithError,
    isPortfolioFetching,
    name,
    onChartTabChange,
    chartCategory,
    onPeriodRangeChange,
    periodRange,
    onRequestDeactivate
  }) => {
    return (
      <div className="content">
        <section className="content__header">
          <Heading view="main" active>
            {t('pages.overview.title')} {name}
          </Heading>

          <Button
            view={ButtonView.redLayout}
            onClick={onRequestDeactivate}
          >
            {t('pages.investors.view.deactivate')}
          </Button>

        </section>

        {/* <section className="overview__content"> */}
          {/* <section className="overview__right">
            <Section className="overview__section overview__news">
              <Heading view="secondary" active>
                {t('pages.overview.news.title')}
              </Heading>

                <section ref={newsRef} className="overview__news-content">
                  {isNewsFetching ? <Spinner /> : <News news={news} />}
                </section>

              <section className="overview__news-footer overview__section-footer">
                <Button unfilled onClick={onViewNewsClick}>
                  <NewsIcon width="16px" height="16px" />
                  {t('pages.overview.news.viewMore')}
                </Button>
              </section>
            </Section>
          </section> */}

          {/* <section className="overview__left"> */}
            <PortfolioSummary
              isPortfolioFetching={isPortfolioFetching}
              isFetchedWithError={isFetchedWithError}
              portfolioSummaryList={portfolioSummaryList}
              width={width!}
              chartData={chartData}
              tooltips={tooltips}
              onViewClick={onViewClick}
              onTabChange={onChartTabChange!}
              chartCategory={chartCategory}
              onPeriodRangeChange={onPeriodRangeChange}
              periodRange={periodRange}
            />

            <Section className="overview__section overview__products">
              <Heading view="secondary" active>
                {t('pages.overview.products.title')}
              </Heading>

              <div className='overview__products-content' ref={topProductsRef}>
                {isProductsFetching ? (
                  <Spinner />
                ) : (
                  <Table
                    theadData={topProductsTableHeader}
                    tbodyData={topProducts}
                    sortedFields={{ indexes: [0] }}
                    multiSortFields={[0, 1, 3, 4, 5]}
                    centeredColumns={[3, 4]}
                    emptyState={t('pages.overview.products.table.empty')}
                  />
                )}
              </div>

              <section className="overview__products-footer overview__section-footer">
                <Button
                  view={ButtonView.unfilled}
                  onClick={() => onViewClick('products')}
                >
                  <ProductsIcon width="16px" height="16px" />

                  {t('pages.overview.products.viewMore')}
                </Button>
              </section>
            </Section>

            <Section className="overview__section overview__transactions">
              <Heading view="secondary" active>
                {t('pages.overview.transactions.title')}
              </Heading>

              <section className='overview__transactions-content' ref={lastTransactionsRef}>
                {isTransactionsFetching ? (
                  <Spinner />
                ) : (
                  <Table
                    theadData={lastTransactionsTableHeader}
                    tbodyData={lastTransactions}
                    sortedFields={{ indexes: [3] }}
                    centeredColumns={[3]}
                    emptyState={t('pages.overview.transactions.table.empty')}
                  />
                )}
              </section>

              <section className="overview__transactions-footer overview__section-footer">
                <Button
                  view={ButtonView.unfilled}
                  onClick={() => onViewClick('transactions')}
                >
                  <TransactionsIcon width="16px" height="16px" />

                  {t('pages.overview.transactions.viewMore')}
                </Button>
              </section>
            </Section>
          {/* </section> */}
        {/* </section> */}
      </div>
    );
  }
);

export default Overview;
