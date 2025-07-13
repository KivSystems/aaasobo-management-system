import React from "react";
import styles from "./Modal.module.scss";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
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

  const isWelcomeModal = className === "welcomeModal";

  const handleOverlayClick = () => {
    if (!isWelcomeModal && onClose) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${className ? styles[className] : ""} `}
      onClick={handleOverlayClick}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {!isWelcomeModal && onClose && (
          <div className={styles.closeButton} onClick={handleCloseClick}>
            <XMarkIcon strokeWidth={2.5} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
