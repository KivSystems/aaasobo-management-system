import React from "react";
import styles from "./InfoBanner.module.scss";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

type InfoBannerProps = {
  className?: string;
  info: React.ReactNode;
};

const InfoBanner: React.FC<InfoBannerProps> = ({ className, info }) => {
  return (
    <div
      className={`${styles.infoBanner} ${className ? styles[className] : ""}`}
    >
      <div className={styles.infoBanner__iconWrapper}>
        <InformationCircleIcon className={styles.infoBanner__icon} />
      </div>
      <div className={styles.infoBanner__notice}>{info}</div>
    </div>
  );
};

export default InfoBanner;
