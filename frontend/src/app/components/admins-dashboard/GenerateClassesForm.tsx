"use client";

import React, { useState } from "react";
import ActionButton from "../elements/buttons/actionButton/ActionButton";
import Modal from "../elements/modal/Modal";
import GenerateClassesModal from "./GenerateClassesModal";
import { useFormState } from "react-dom";
import { generateClassesAction } from "@/app/actions/updateContent";
import { useFormMessages } from "@/app/hooks/useFormMessages";

function GenerateClassesForm() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [generateClassesResultState, formAction] = useFormState(
    generateClassesAction,
    undefined,
  );
  const { localMessages, clearErrorMessage } = useFormMessages(
    generateClassesResultState,
  );

  return (
    <>
      <ActionButton
        btnText={"Generate Classes"}
        className="rebookClass"
        onClick={() => setIsModalOpen(true)}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="businessCalendarModal"
      >
        <form action={formAction}>
          <GenerateClassesModal />
        </form>
      </Modal>
    </>
  );
}

export default GenerateClassesForm;
