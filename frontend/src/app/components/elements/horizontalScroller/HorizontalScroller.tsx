import { useEffect, useRef, useState } from "react";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import styles from "./HorizontalScroller.module.scss";

type HorizontalScrollerProps = {
  children: React.ReactNode;
  className?: string;
};

const HorizontalScroller = ({
  children,
  className,
}: HorizontalScrollerProps) => {
  const [hovered, setHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainer = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const offset = scrollContainer.current.clientWidth;
      scrollContainer.current.scrollBy({
        left: direction === "left" ? -offset : offset,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const el = scrollContainer.current;

    el?.addEventListener("scroll", checkScrollPosition);
    return () => el?.removeEventListener("scroll", checkScrollPosition);
  }, []);

  return (
    <div
      className={`${styles.horizontalScroller} ${className || ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && canScrollLeft && (
        <div
          className={styles.horizontalScroller__arrowLeft}
          onClick={() => scroll("left")}
        >
          <ChevronDoubleLeftIcon className={styles.horizontalScroller__icon} />
        </div>
      )}

      {hovered && canScrollRight && (
        <div
          className={styles.horizontalScroller__arrowRight}
          onClick={() => scroll("right")}
        >
          <ChevronDoubleRightIcon className={styles.horizontalScroller__icon} />
        </div>
      )}

      <div className={styles.horizontalScroller__content} ref={scrollContainer}>
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroller;
