"use client";

import { useEffect, useState } from "react";
import styles from "./RegularClasses.module.scss";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getSubscriptionsByCustomerId } from "@/app/helper/api/subscriptionsApi";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import CurrentSubscription from "@/app/components/customers-dashboard/regular-classes/CurrentSubscription";
import AddSubscription from "@/app/components/customers-dashboard/regular-classes/AddSubscription";
import Loading from "../../elements/loading/Loading";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { ADD_NEW_SUBSCRIPTION } from "@/app/helper/messages/customerDashboard";

function RegularClasses({
  adminId,
  customerId,
  userSessionType,
}: {
  adminId?: number;
  customerId: number;
  userSessionType?: UserType;
}) {
  const { language } = useLanguage();
  const [subscriptionsData, setSubscriptionsData] =
    useState<Subscriptions | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const handleAddRegularClass = () => {
    setShowAddPlan(true);
  };

  const handleCloseForm = () => {
    setShowAddPlan(false);
  };

  const handleUpdateSubscription = () => {
    setUpdateCount(updateCount + 1);
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getSubscriptionsByCustomerId(customerId);
        setSubscriptionsData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubscription();
  }, [customerId, updateCount]);

  if (!subscriptionsData) {
    return <Loading />;
  }

  return (
    <>
      {userSessionType === "admin" ? (
        <div className={styles.addBtn}>
          <ActionButton
            onClick={handleAddRegularClass}
            btnText={ADD_NEW_SUBSCRIPTION[language]}
            className="addBtn"
            Icon={PlusIcon}
          />
        </div>
      ) : null}
      {showAddPlan && (
        <AddSubscription
          customerId={customerId}
          isOpen={true}
          onClose={handleCloseForm}
          updateSubscription={handleUpdateSubscription}
        />
      )}
      <CurrentSubscription
        subscriptionsData={subscriptionsData}
        adminId={adminId}
        customerId={customerId}
        userSessionType={userSessionType}
        language={language}
        onSubscriptionDeleted={handleUpdateSubscription}
      />
    </>
  );
}

export default RegularClasses;
