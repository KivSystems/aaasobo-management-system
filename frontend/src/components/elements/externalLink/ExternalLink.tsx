import styles from "./ExternalLink.module.scss";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const ExternalLinkComponent = ({
  className,
  linkName,
  url,
}: {
  className?: string;
  linkName: string;
  url: string;
}) => {
  const clickHandler = () => {
    window.open(url, "_blank");
  };

  return (
    <div
      className={`${styles.externalLink} ${className ? styles[className] : ""}`}
      onClick={clickHandler}
    >
      {linkName}
      <ArrowTopRightOnSquareIcon className={styles.icon} />
    </div>
  );
};

export default ExternalLinkComponent;
