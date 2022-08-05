import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../../../../../shared/types/common";
import { Product, ProductCategory } from "../../../../../shared/types/product";
import { Query } from "../../../../../shared/types/response";

import ProductService from "../../../services/ProductService";
import UserContext from "../../../store/contexts/user-context";

import { createQueryString, delay, translate } from "../../../utils";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import { centeredColumns, createProductRows, limitStep, rolesForCreate, theadData } from "./products.constants";

type ProductsCategories = {
  [key in ProductCategory]: number;
} & { all: number };


type ProductsTabs = {
  [key in keyof ProductsCategories]: Label
};

const initialCategories = Object.keys(ProductCategory)
  .reduce((acc, curr) => ({ all: 0, ...acc, [curr]: 0 }), {}) as ProductsCategories;

  const productsTabs: ProductsTabs = {
    Bond: {
      value: 'Bond',
      label: 'Bond'
    },
    Certificate: {
      value: 'Certificate',
      label: 'Certificate'
    },
    Share: {
      value: 'Share',
      label: 'Share'
    },
    all: {
      value: 'all',
      label: 'All'
    }
  };

export const useProducts = () => {
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [tableHeader, setTableHeader] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [productRows, setProductRows] = useState<Row[]>([]);

  const [selectedTab, setSelectedTab] = useState<Label>(productsTabs.all);
  const [searchValue, setSearchValue] = useState("");

  const [productsCategories, setProductsCategories] = useState<ProductsCategories>({ ...initialCategories });

  const { data: { role } } = UserContext.useContext();

  const { t, i18n } = useTranslation();

  const centeredProductsColumns = useMemo(() =>role && centeredColumns[role], [role]);

  const onToggleForm = () => setShowForm(!showForm);

  const onTabChange = (selected: string) => {
    setIsFetching(true);
    setSelectedTab(getCurrentTab(productsTabs, selected));
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

  useEffect(() => setTableHeader(translate(theadData(role))), [role, i18n.language]);

  useEffect(() => {
    setProductsCategories({ ...initialCategories });

    if (!showForm) {
      delay(() => {
        setIsFetching(true);

        const search = searchValue.trim();
        const query: Query = {
          skip,
          limit: limitStep,
          ...(selectedTab.value !== productsTabs.all.value ? { categories: selectedTab.value } : {}),
          ...(search ? { name: search } : {})
          };

        ProductService.getList(createQueryString(query))
          .then((res) => {
            const rows: Row[] = createProductRows(res.data.data, role);

            setProducts(res.data.data);
            setProductRows(rows);

            setTotal(res.data.count);

            type Counts = {
              [key: string]: number;
            } & { all: number; };

            const productCaregoriesData: Counts = res.data.totals.reduce((acc, curr) => {
              return { ...acc, [curr.category]: curr.count, all: acc.all + curr.count };
            }, {
                all: 0,
                Bond: 0,
                Certificate: 0,
                Share: 0
            });

            setProductsCategories(productCaregoriesData as ProductsCategories);
          })
          .finally(() => setIsFetching(false));
      }, 500);
    }
  }, [searchValue, showForm, skip, role, selectedTab]);

  useEffect(() => {
    setSkip(0);
    setShowFromCount(1);
  }, [searchValue]);

  useEffect(() => {
    if (selectedTab.value === productsTabs.all.value) {
      setShowFromCount(skip + 1);
      setTotal(productsCategories.all);
      return setProductRows(createProductRows(products, role));
    }

    const filteredProducts = products.filter(product => (
      product?.category === selectedTab.value
    ));

    setProductRows(createProductRows(filteredProducts, role));
    setTotal(filteredProducts.length);
    setShowFromCount(1);
  }, [selectedTab, i18n.language]);

  return {
    t,
    onToggleForm,
    showForm,
    searchValue,
    setSearchValue,
    tableHead: tableHeader,
    productRows,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    isFetching,
    onTabChange,
    selectedTab,
    productsCategories,
    showFromCount,
    isCreateAllowed: rolesForCreate.includes(role),
    centeredProductsColumns
  };
};
