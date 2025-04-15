type Events = {
  id: string;
  start: string;
  end: string;
};

type Instructors = {
  data: Instructor[];
};

type Instructor = {
  id: number;
  name: string;
  availabilities: Availability[];
  unavailabilities: Availability[];
  email: string;
  nickname: string;
  classURL: string;
  icon: string;
  meetingId: string;
  passcode: string;
  introductionURL: string;
};

type InstructorProfile = {
  id: number;
  name: string;
  nickname: string;
};

type Availability = { dateTime: string };

type ClassType = {
  id: number;
  dateTime: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  instructor: {
    id: number;
    name: string;
    icon: string;
    classURL: string;
    nickname: string;
    meetingId: string;
    passcode: string;
  };
  classAttendance: { children: { id: number; name: string }[] };

  status:
    | "booked"
    | "completed"
    | "canceledByCustomer"
    | "canceledByInstructor";
  isRebookable: boolean;
  recurringClassId: number;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  class?: CustomersClass[];
  prefecture: string;
};

type CustomersClass = {
  id: number;
  instructorId: number;
  customerId: number;
  dateTime: string;
  status:
    | "booked"
    | "completed"
    | "canceledByCustomer"
    | "canceledByInstructor";
};

type Child = {
  id: number;
  customerId?: number;
  name: string;
  birthdate?: string;
  personalInfo?: string;
};

type Plans = Plan[];

type Plan = {
  id: number;
  name: string;
  description: string;
};

type Subscriptions = {
  subscriptions: Subscription[];
};

type Subscription = {
  id: number;
  planId: number;
  customerId: number;
  startAt: string;
  endAt: string;
  plan: Plan;
};

type RegisterSubscription = {
  planId: number;
  startAt: string;
};

type RecurringClasses = {
  recurringClasses: RecurringClass[];
};

type RecurringClass = {
  id: number;
  dateTime: string;
  instructorId: number;
  instructor: Instructor;
  childrenIds: Set<number>;
  subscription: Subscriptions;
  recurringClassAttendance: Attendance[];
  endAt: Date;
};

type Attendance = {
  children: Child;
};

type EventType = {
  classId?: number;
  start: string;
  end: string;
  title: string;
  color: string;
};

type ClassForCalendar = {
  id: number;
  dateTime: string;
  instructor: Instructor;
  classAttendance: {
    children: Child[];
  };
  status:
    | "booked"
    | "completed"
    | "canceledByCustomer"
    | "canceledByInstructor";
  isRebookable: boolean;
};

type RecurringClassState = {
  id: number;
  day: Day;
  time: string;
  instructorId: number;
  childrenIds: Set<number>;
};

type InstructorClassDetail = {
  id: number;
  dateTime: string;
  customerName: string;
  classURL: string;
  meetingId: string;
  passcode: string;
  attendingChildren: Child[];
  customerChildren: Child[];
  status:
    | "booked"
    | "completed"
    | "canceledByCustomer"
    | "canceledByInstructor";
  isRebookable: boolean;
};

type Tab = {
  label: string;
  content: React.ReactNode;
};

type RecurringAvailability = {
  id: number;
  startAt: Date;
  endAt: Date | null;
};

type LinkType = {
  name: string;
  href: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};

type UserType = "admin" | "customer" | "instructor";

type ForgotPasswordFormState = {
  errorMessage?: string;
  successMessage?: string;
};

type RegisterFormState = {
  password?: string;
  name?: string;
  email?: string;
  passConfirmation?: string;
  prefecture?: string;
  isAgreed?: string;
  errorMessage?: string;
  successMessage?: string;
};

type ResetPasswordFormState = {
  queryError?: string;
  password?: string;
  passwordConfirmation?: string;
  errorMessage?: string;
  successMessage?: string;
};
type UpcomingClass = {
  id: number;
  dateTime: string;
  instructor: {
    nickname: string;
    icon: string;
  };
  attendingChildren: string[];
};

type CancelClassesModalControllerProps = {
  upcomingClasses: UpcomingClass[] | [];
  customerId: number;
  isAdminAuthenticated?: boolean;
};

type CancelClassesModalProps = {
  upcomingClasses: UpcomingClass[] | [];
  customerId: number;
  isAdminAuthenticated?: boolean;
  isCancelingModalOpen: boolean;
  setIsCancelingModalOpen: Dispatch<SetStateAction<boolean>>;
};

type SelectedClass = {
  classId: number;
  classDateTime: string;
};

type UpcomingClassesProps = {
  upcomingClasses: UpcomingClass[] | [];
  selectedClasses: SelectedClass[] | [];
  setSelectedClasses: Dispatch<SetStateAction<SelectedClass>>;
  isCancelingModalOpen: boolean;
};

type ClassInfo = { classId: number; classDateTime: string };
type ClassInfoList = ClassInfo[];
type SetClassInfoList = React.Dispatch<React.SetStateAction<ClassInfoList>>;
