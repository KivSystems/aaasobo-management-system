import ListTable from "@/components/admins-dashboard/ListTable";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";
import { getCookie } from "@/proxy";
import {
  ClassChangeHistoryResponse,
  formatHistoryDate,
  formatHistoryDetails,
} from "@shared/schemas/classChangeHistory";
export default async function Page() {
  await authenticateUserSession("admin");
  const cookie = await getCookie();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000"}/admins/class-change-history`,
    { headers: { Cookie: cookie }, cache: "no-store" },
  );
  if (!response.ok) throw new Error("クラス変更履歴を取得できませんでした");
  const history = ClassChangeHistoryResponse.parse(await response.json());
  const columns = [
    "操作日時",
    "お客様",
    "お子様",
    "操作種別",
    "変更対象",
    "操作者",
  ];
  const data = history.map((entry) => ({
    操作日時: formatHistoryDate(entry.occurredAt),
    お客様: entry.customerName,
    お子様: entry.children.map((child) => child.name).join(", "),
    操作種別:
      entry.type === "REGULAR_CLASS_CHANGED"
        ? "レギュラークラス変更"
        : entry.type === "CLASS_CANCELED"
          ? "キャンセル"
          : "振替予約",
    変更対象: formatHistoryDetails(entry.details),
    操作者: entry.actorRole === "CUSTOMER" ? "お客様" : "管理者",
  }));
  return (
    <div>
      <h1>クラス変更履歴</h1>
      <p>日時はすべて日本時間</p>
      <p>過去90日分の履歴を表示</p>
      <ListTable
        listType="Class Change History"
        fetchedData={data}
        omitItems={["No"]}
        linkItems={[]}
        linkUrls={[]}
        itemNameLabels={{}}
        replaceItems={[]}
        userType="admin"
        columnOrder={columns}
      />
    </div>
  );
}
