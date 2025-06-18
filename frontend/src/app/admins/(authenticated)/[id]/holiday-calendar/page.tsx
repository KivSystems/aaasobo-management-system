import HolidayCalendarForAdmin from "@/app/components/admins-dashboard/HolidayCalendarForAdmin";

const Page = () => {
  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <>
      <HolidayCalendarForAdmin isAdminAuthenticated={isAuthenticated} />
    </>
  );
};

export default Page;
