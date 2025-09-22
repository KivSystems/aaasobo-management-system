import React from "react";
import Image from "next/image";
import styles from "./MaintenancePage.module.scss";

function MaintenancePage() {
  return (
    <div className={styles.maintenanceContainer}>
      <p>現在メンテナンス中のためご不便のほどおかけします。</p>
      <div className={styles.logoWrapper}>
        <Image
          src="/images/logo2.svg"
          alt="maintenance"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
      <p>Our service is currently under maintenance.</p>
    </div>
  );
}

export default MaintenancePage;
