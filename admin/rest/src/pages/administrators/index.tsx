import Card from "@components/common/card";
import Layout from "@components/layouts/admin";
import Search from "@components/common/search";
import CustomerList from "@components/user/user-list";
import LinkButton from "@components/ui/link-button";
import { useMemo, useState } from "react";
import ErrorMessage from "@components/ui/error-message";
import Loader from "@components/ui/loader/loader";
import { useUsersQuery } from "@data/user/use-users.query";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ROUTES } from "@utils/routes";
import { SortOrder, User } from "@ts-types/generated";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const [orderBy, setOrder] = useState("created_at");
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const {
    data,
    isLoading: loading,
    error,
  } = useUsersQuery({
    limit: 0,
    page,
    text: searchTerm,
    orderBy,
    sortedBy,
  });

  const staffs = useMemo(() => {
    if (!data) return data;
    return {
      ...data,
      users: {
        ...data?.users,
        data:
          data?.users?.data?.filter(
            (user: any) =>
              user.permissions.filter(
                (permission: any) =>
                  permission.name !== "customer" &&
                  permission.name !== "store_owner"
              ).length > 0
          ) || [],
      },
    };
  }, [data]);
  if (loading) return <Loader text={t("common:text-loading")} />;
  if (error) return <ErrorMessage message={error.message} />;
  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }
  function handlePagination(current: any) {
    setPage(current);
  }
  return (
    <>
      <Card className="flex flex-col md:flex-row items-center mb-8">
        <div className="md:w-1/4 mb-4 md:mb-0">
          <h1 className="text-lg font-semibold text-heading">
            {t("form:input-label-administrators")}
          </h1>
        </div>

        <div className="w-full md:w-3/4 flex items-center ms-auto">
          <Search onSearch={handleSearch} />
          <LinkButton
            href={`${ROUTES.ADMINISTRATORS}/create`}
            className="h-12 ms-4 md:ms-6"
          >
            <span>+ {t("form:button-label-add-administrator")}</span>
          </LinkButton>
        </div>
      </Card>

      {loading ? null : (
        <CustomerList
          customers={staffs?.users}
          onPagination={handlePagination}
          onOrder={setOrder}
          onSort={setColumn}
          edit
        />
      )}
    </>
  );
}
Customers.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["table", "common", "form"])),
  },
});
