import { Fragment } from "react";

import { hoc } from "./../../../utils/hoc";

import { PlusIcon } from "../../components/icons";
import { Button, Pagination } from "../../components/UI";
import Table from "../../components/UI/Table";
import { Spinner } from "../../components/UI/Spinner";
import { Heading } from "../../components/UI/Heading";
import CreateTransactionForm from "./CreateTransactionForm";

import { useTransactions } from "./transactions.hook";
import "./transactions.scss";
import { Tab } from "../../components/UI/Tabs/Tab";
import { capitalize } from "../../../utils/fn";
import Tabs from "../../components/UI/Tabs";
import { MappingTransactionCategory } from './transactions.constants';

const TransactionsView = hoc(
  useTransactions,
  ({
    t,
    tableHead,
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
    isCreateAllowed,
    centeredTransactionsColumns
  }) => (
    <div className="content">
      <div className="content__header">
        <Heading view="main" active>
          {t("pages.transactions.title")}
        </Heading>

        {isCreateAllowed && (
          <Fragment>
            <Button onClick={onToggleForm}>
              <PlusIcon width="16px" height="16px" />
              {t("pages.transactions.newTransaction")}
            </Button>

            {showForm && <CreateTransactionForm visible={showForm} onClose={onToggleForm} />}
          </Fragment>
        )}
      </div>

      <div className="section table-container">
        {isFetching ? (
          <Spinner />
        ) : (
          <Fragment>
            <Tabs selectedId={selectedTab} onChange={onTabChange}>
              <Fragment>
                {Object.entries(transactionsCategories).map((item) => (
                  <Tab
                    key={item[0]}
                    title={capitalize(t(MappingTransactionCategory[item[0]]))}
                    id={item[0]}
                    rightAddons={item[1]}
                  >
                    {transactionRows?.length ? (
                      <Fragment>
                        <Table
                          theadData={tableHead}
                          tbodyData={transactionRows}
                          sortedFields={{ indexes: [3] }}
                          centeredColumns={centeredTransactionsColumns}
                        />

                        <Pagination
                          from={showFromCount}
                          to={skip + limitStep}
                          total={total}
                          delta={limitStep}
                          showNext={goNextPage}
                          showPrev={goPrevPage}
                          disabledNext={transactionRows?.length != 10}
                        />
                      </Fragment>
                    ) : (
                      <Heading view="accent" active>
                        {t("pages.transactions.table.empty")}
                      </Heading>
                    )}
                  </Tab>
                ))}
              </Fragment>
            </Tabs>
          </Fragment>
        )}
      </div>
    </div>
  )
);

export default TransactionsView;
