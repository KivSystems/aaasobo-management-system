import React from "react";

const SameDayCancellationNotice = ({
  language,
}: {
  language: LanguageType;
}) => {
  return language === "ja" ? (
    <p>
      当日（日本時間基準）のクラスをキャンセルされる際は、恐れ入りますが
      <a href="mailto:contact@aaasobo.org">contact@aaasobo.org</a>{" "}
      までご連絡ください。なお、当日キャンセルは振替の対象外となりますのでご了承ください。
    </p>
  ) : (
    <p>
      For same-day cancellations (based on Japan time), please contact us at{" "}
      <a href="mailto:contact@example.com">contact@example.com</a>. Note:
      Same-day cancellations aren&apos;t eligible for rebooking.
    </p>
  );
};

export default SameDayCancellationNotice;
