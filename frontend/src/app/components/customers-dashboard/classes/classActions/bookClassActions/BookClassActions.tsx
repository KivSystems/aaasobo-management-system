import RedirectButton from "@/app/components/elements/buttons/redirectButton/RedirectButton";
import styles from "./BookClassActions.module.scss";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getBookableClasses } from "@/app/helper/api/customersApi";
import BookableClassesModalController from "./bookableClassesModalController/BookableClassesModalController";

export type BookableClassActionsProps = {
  isAdminAuthenticated?: boolean;
  customerId: number;
};

export default async function BookClassActions({
  isAdminAuthenticated,
  customerId,
}: BookableClassActionsProps) {
  const bookableClasses: string[] | null = await getBookableClasses(customerId);

  const bookingURL = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}/classes/book`
    : `/customers/${customerId}/classes/book`;

  return (
    <>
      <div className={styles.calendarActions__booking}>
        <BookableClassesModalController bookableClasses={bookableClasses} />

        <RedirectButton
          linkURL={bookingURL}
          btnText="Book Class"
          Icon={PlusIcon}
          className="bookClass"
          disabled={bookableClasses?.length === 0}
        />
      </div>
    </>
  );
}
