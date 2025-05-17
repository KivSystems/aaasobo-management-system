import React from "react";
import styles from "./Modal.module.scss";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${className ? styles[className] : ""} `}
      onClick={onClose}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.closeButton} onClick={onClose}>
          <XMarkIcon strokeWidth={2.5} />
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
