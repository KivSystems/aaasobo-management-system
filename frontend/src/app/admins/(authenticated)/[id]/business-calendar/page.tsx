import BusinessCalendarForAdmin from "@/app/components/admins-dashboard/BusinessCalendarForAdmin";

const Page = () => {
  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <>
      <BusinessCalendarForAdmin isAdminAuthenticated={isAuthenticated} />
    </>
  );
};

export default Page;
