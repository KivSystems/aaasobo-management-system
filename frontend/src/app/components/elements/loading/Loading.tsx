import React from "react";
import Image from "next/image";
import styles from "./Loading.module.scss";

function Loading({ className }: { className?: string }) {
  return (
    <div
      className={`${styles.loadingContainer} ${className ? styles[className] : ""}`}
    >
      <Image
        src={"/images/spinner.svg"}
        width={100}
        height={100}
        alt="spinner"
      />
    </div>
  );
}

export default Loading;
