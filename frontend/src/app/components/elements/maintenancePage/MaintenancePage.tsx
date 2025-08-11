import React from "react";
import Image from "next/image";
import styles from "./MaintenancePage.module.scss";

function MaintenancePage() {
  return (
    <div className={`${styles.maintenanceContainer}`}>
      <Image
        src={"/images/maintenance.png"}
        width={500}
        height={500}
        alt="maintenance"
      />
    </div>
  );
}

export default MaintenancePage;
