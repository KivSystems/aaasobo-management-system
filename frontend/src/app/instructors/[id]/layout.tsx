import styles from "./layout.module.scss";
import SideNav from "@/app/components/layouts/sideNav/SideNav";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const instructorId = parseInt(params.id);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <SideNav userId={instructorId} userType="instructor" />
      </div>
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}
