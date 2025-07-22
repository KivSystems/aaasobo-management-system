import { LINE_QR_CODE_URL } from "@/app/helper/data/contacts";
import React from "react";

const SameDayCancellationNotice = ({
  language,
}: {
  language: LanguageType;
}) => {
  return language === "ja" ? (
    <p>
      当日（日本時間基準）のクラスをキャンセルされる際は、恐れ入りますが
      <a
        href={LINE_QR_CODE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        アーソボLINEまでご連絡ください
      </a>
      。なお、当日キャンセルは振替の対象外となりますのでご了承ください。
    </p>
  ) : (
    <p>
      For same-day cancellations (based on Japan time), please contact us via{" "}
      <a
        href={LINE_QR_CODE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        AaasoBo! LINE
      </a>
      . Please note that same-day cancellations are not eligible for rebooking.
    </p>
  );
};

export default SameDayCancellationNotice;
