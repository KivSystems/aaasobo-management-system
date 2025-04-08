import Image from "next/image";
import styles from "./page.module.scss";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.home}>
      <h1 className={styles.home__title}>AaasoBo! Landing Page</h1>
      <Link href="/admins/login">Login as admin</Link>
      <Link href="/customers/login">Login as customer</Link>
      <Link href="/instructors/login">Login as instructor</Link>
    </main>
  );
}
