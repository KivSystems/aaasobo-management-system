import ListTable from "@/components/admins-dashboard/ListTable";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";

const columns = ["日時", "種別", "内容"];

export default async function Page() {
  await authenticateUserSession("admin");

  return (
    <ListTable
      listType="Log List"
      fetchedData={[]}
      omitItems={[]}
      linkItems={[]}
      linkUrls={[]}
      itemNameLabels={{}}
      replaceItems={[]}
      userType="admin"
      columnOrder={columns}
    />
  );
}
