import { fetchClassesForCalendar } from "@/app/helper/api/classesApi";
import CancelClassesModalController from "./cancelClassesModalController/CancelClassesModalController";

export default async function CancelClassesActions({
  customerId,
}: {
  customerId: number;
}) {
  const classes: ClassForCalendar[] | null = await fetchClassesForCalendar(
    customerId,
    "customer",
  );

  return (
    <CancelClassesModalController customerId={customerId} classes={classes} />
  );
}
