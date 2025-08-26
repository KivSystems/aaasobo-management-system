"use client";

import React, { useEffect, useState } from "react";
import ActionButton from "../elements/buttons/actionButton/ActionButton";
import Modal from "../elements/modal/Modal";
import GenerateClassesModal from "./GenerateClassesModal";
import { useFormState } from "react-dom";
import { generateClassesAction } from "@/app/actions/updateContent";

function GenerateClassesForm() {
  const initialFormState = {
    errorMessage: "",
    successMessage: "",
  };
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [generateClassesResultState, formAction] = useFormState(
    generateClassesAction,
    initialFormState,
  );
  const [localState, setLocalState] = useState<{
    errorMessage: string;
    successMessage: string;
  }>(initialFormState);

  useEffect(() => {
    setLocalState({
      errorMessage: generateClassesResultState.errorMessage ?? "",
      successMessage: generateClassesResultState.successMessage ?? "",
    });
  }, [generateClassesResultState]);

  return (
    <>
      <ActionButton
        btnText={"Generate Classes"}
        className="rebookClass"
        onClick={() => setIsModalOpen(true)}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setLocalState(initialFormState);
        }}
        className="businessCalendarModal"
      >
        <form action={formAction}>
          <GenerateClassesModal
            error={localState.errorMessage}
            success={localState.successMessage}
          />
        </form>
      </Modal>
    </>
  );
}

export default GenerateClassesForm;
