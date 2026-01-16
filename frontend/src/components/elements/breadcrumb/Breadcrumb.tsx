"use client";

import React from "react";
import Link from "next/link";
import styles from "./Breadcrumb.module.scss";
import { useLanguage } from "@/contexts/LanguageContext";

interface BreadcrumbProps {
  links: { href?: string; label: string | { ja: string; en: string } }[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ links, className }) => {
  const { language } = useLanguage();

  return (
    <nav
      className={`${styles.breadcrumb} ${className ? styles[className] : ""} ${styles[language]}`}
    >
      <ul className={styles.breadcrumb__list}>
        {links.map((link, index) => (
          <React.Fragment key={index}>
            {link.href ? (
              <li className={styles.breadcrumb__item}>
                <Link href={link.href} passHref>
                  {typeof link.label === "string"
                    ? link.label
                    : link.label[language]}
                </Link>
              </li>
            ) : (
              <li className={styles.breadcrumb__item}>
                {" "}
                {typeof link.label === "string"
                  ? link.label
                  : link.label[language]}
              </li>
            )}
            {index < links.length - 1 && (
              <li className={styles.breadcrumb__separator}>{" >> "}</li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
