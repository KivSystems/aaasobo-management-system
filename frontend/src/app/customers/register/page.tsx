"use client";

import React, { useState } from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";
import RegisterCustomerForm from "@/app/components/features/registerForm/registerCustomerForm/RegisterCustomerForm";
import RegisterChildForm from "@/app/components/features/registerForm/registerChildForm/RegisterChildForm";
import RegisterCompleteMessage from "@/app/components/features/registerForm/registerCompleteMessage/RegisterCompleteMessage";

function RegisterCustomerPage() {
  const [registrationStep, setRegistrationStep] = useState<
    "customer" | "child" | "complete"
  >("customer");
  const [customerData, setCustomerData] = useState<RegisteringCustomer>({
    name: "",
    email: "",
    password: "",
    prefecture: "",
    isAgreed: false,
  });
  const [childData, setChildData] = useState<RegisteringChild>({
    name: "",
    birthdate: "",
    personalInfo: "",
  });
  const { language } = useLanguage();

  const fallbackEmail = language === "ja" ? "メールアドレス" : "your email";
  const emailToShow = customerData.email || fallbackEmail;

  return (
    <main>
      <div className={styles.outsideContainer}>
        <div className={styles.container}>
          <Image
            src={"/images/logo2.svg"}
            alt="logo"
            width={100}
            height={100}
            className={styles.logo}
            priority={true}
          />

          {(registrationStep === "customer" ||
            registrationStep === "child") && (
            <header className={styles.header}>
              <h1>
                {language === "ja"
                  ? "無料アカウントを作成"
                  : "Create a free account"}
              </h1>
              <p>
                {language === "ja"
                  ? "すでにアカウントをお持ちですか？"
                  : "Already a member?"}{" "}
                <Link href="/customers/login">
                  {language === "ja" ? "ログイン" : "Login"}
                </Link>
              </p>
            </header>
          )}

          {registrationStep === "customer" && (
            <RegisterCustomerForm
              customerData={customerData}
              setCustomerData={setCustomerData}
              onNextStep={() => setRegistrationStep("child")}
              language={language}
            />
          )}

          {registrationStep === "child" && (
            <RegisterChildForm
              customerData={customerData}
              childData={childData}
              setChildData={setChildData}
              onPreviousStep={() => setRegistrationStep("customer")}
              onNextStep={() => setRegistrationStep("complete")}
              language={language}
            />
          )}

          {registrationStep === "complete" && (
            <RegisterCompleteMessage
              language={language}
              emailToShow={emailToShow}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default RegisterCustomerPage;
