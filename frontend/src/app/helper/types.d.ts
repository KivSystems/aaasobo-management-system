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
  createdAt: string;
};

type InstructorRebookingProfile = {
  id: number;
  name: string;
  nickname: string;
  icon: string;
  introductionURL: string;
};

type Availability = { dateTime: string };

type ClassStatus =
  | "booked"
  | "rebooked"
  | "completed"
  | "canceledByCustomer"
  | "canceledByInstructor"
  | "pending"
  | "rebooked";

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

  status: ClassStatus;
  recurringClassId: number;
  rebookableUntil: string;
  updatedAt: string;
  classCode: string;
};

type Admin = {
  id: number;
  name: string;
  email: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  class?: CustomersClass[];
  prefecture: string;
};

type CustomerClass = {
  classId: number;
  start: string;
  end: string;
  title: string;
  color: string;
  instructorIcon: string;
  instructorNickname: string;
  instructorName: string;
  instructorClassURL: string;
  instructorMeetingId: string;
  instructorPasscode: string;
  classStatus: ClassStatus;
  rebookableUntil: string;
  classCode: string;
  updatedAt: string;
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
  weeklyClassTimes?: number;
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
  status: ClassStatus;
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
  status: ClassStatus;
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

type CategoryType = "event" | "plan";

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
  weeklyClassTimes?: string;
  description?: string;
  errorMessage?: string;
  successMessage?: string;
  language?: LanguageType;
};

type UpdateFormState = {
  name?: string;
  nickname?: string;
  email?: string;
  classURL?: string;
  meetingId?: string;
  passcode?: string;
  introductionURL?: string;
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

type CustomerProfile = {
  id: number;
  name: string;
  email: string;
  prefecture: string;
  createdAt: string;
};

type LanguageType = "ja" | "en";

type ClassInfo = { classId: number; classDateTime: string };
type ClassInfoList = ClassInfo[];
type SetClassInfoList = React.Dispatch<React.SetStateAction<ClassInfoList>>;

type BusinessSchedule = {
  id: number;
  date: string;
  name: string;
  color: string;
};

type BusinessCalendarClientProps = {
  businessSchedule?: BusinessSchedule[] | [];
  isAdminAuthenticated?: boolean;
  validRange: {
    start: string;
    end: string;
  };
};

type CustomerCalendarProps = {
  isAdminAuthenticated?: boolean;
  customerId: number;
  classes: CustomerClass[] | [];
  createdAt: string;
};

type InstructorCalendarClientProps = {
  adminId?: number | null;
  instructorId: number;
  isAdminAuthenticated?: boolean;
  instructorCalendarEvents: EventType[];
  validRange: {
    start: string;
    end: string;
  };
};

type RebookableClass = {
  id: number;
  rebookableUntil: Date;
  classCode: string;
};

type RebookingModalControllerProps = {
  rebookableClasses: RebookableClass[] | [];
  hasChildProfile: boolean;
  modalContent: React.ReactNode;
};

type RebookingModalProps = {
  adminId?: number;
  isAdminAuthenticated?: boolean;
  customerId: number;
  rebookableClasses: RebookableClass[] | [];
};

type RebookableClassListProps = RebookingModalProps & {
  language: LanguageType;
};

type LocalizedMessage = {
  ja: string;
  en: string;
};

type TokenVerificationResult = {
  valid: boolean;
  needsResetLink: boolean;
  message: LocalizedMessage;
};

type ResetPasswordFormProps = {
  token: string;
  userType: UserType;
  tokenVerificationResult: TokenVerificationResult;
};

type ClassDetailProps = {
  customerId: number;
  classDetail: CustomerClass | null;
  isAdminAuthenticated?: boolean;
  handleModalClose: () => void;
  language: LanguageType;
};

type InstructorAvailability = {
  instructorId: number;
  dateTime: string;
};

type StringMessages = Record<string, string>;
type LocalizedMessages = Record<string, LocalizedMessage>;

type FormResult = StringMessages | LocalizedMessages;

type RebookingSteps =
  | "selectOption"
  | "selectInstructor"
  | "selectDateTime"
  | "confirmRebooking";

type RebookingFormProps = {
  customerId: number;
  classId: number;
  instructorAvailabilities: InstructorAvailability[] | [];
  instructorProfiles: InstructorRebookingProfile[];
  childProfiles: Child[];
  adminId?: number;
  isAdminAuthenticated?: boolean;
};

type RebookableInstructorsListProps = {
  instructorProfiles: InstructorRebookingProfile[];
  instructorAvailabilities: InstructorAvailability[] | [];
  setInstructorToRebook: (instructor: { id: number; name: string }) => void;
  rebookingOption: "instructor" | "dateTime";
  setRebookingStep: (step: RebookingSteps) => void;
  dateTimeToRebook: string | null;
};

type RebookableTimeSlotsProps = {
  setDateTimeToRebook: (dateTime: string) => void;
  setRebookingStep: (step: RebookingSteps) => void;
  instructorToRebook: {
    id: number;
    name: string;
  };
  instructorAvailabilities: InstructorAvailability[] | [];
  rebookingOption: "instructor" | "dateTime";
};

type ConfirmRebookingProps = {
  instructorToRebook: {
    id: number;
    name: string;
  };
  dateTimeToRebook: string;
  rebookingOption: "instructor" | "dateTime";
  setRebookingStep: (step: RebookingSteps) => void;
  childProfiles: Child[];
  customerId: number;
  classId: number;
  adminId?: number;
  isAdminAuthenticated?: boolean;
};

type ChildConflictResponse =
  | { conflictingChildren: string[] }
  | { message: LocalizedMessage };
