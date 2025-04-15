"use client";

import Modal from "@/app/components/elements/modal/Modal";
import { useState } from "react";
import BookableClassesModal from "./bookableClassesModal/BookableClassesModal";
import { BookableClassesInfo } from "./bookableClassesInfo/BookableClassesInfo";

export default function BookableClassesModalController({
  bookableClasses,
}: {
  bookableClasses: string[] | null;
}) {
  const [isBookableClassesModalOpen, setIsBookableClassesModalOpen] =
    useState(false);

  return (
    <>
      <BookableClassesInfo
        bookableClasses={bookableClasses}
        onClick={() => setIsBookableClassesModalOpen(true)}
      />
      <Modal
        isOpen={isBookableClassesModalOpen}
        onClose={() => setIsBookableClassesModalOpen(false)}
      >
        <BookableClassesModal bookableClasses={bookableClasses} />
      </Modal>
    </>
  );
}
