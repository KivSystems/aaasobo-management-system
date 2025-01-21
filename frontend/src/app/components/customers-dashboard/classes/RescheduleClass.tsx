import { getChildrenByCustomerId } from "@/app/helper/api/childrenApi";
import { getInstructors } from "@/app/helper/api/instructorsApi";
import { getClassById } from "@/app/helper/api/classesApi";
import { useEffect, useState } from "react";
import EditClassForm from "@/app/components/customers-dashboard/classes/EditClassForm";

function RescheduleClass({
  customerId,
  classId,
  isAdminAuthenticated,
}: {
  customerId: number;
  classId: number;
  isAdminAuthenticated?: boolean;
}) {
  const [editedClass, setEditedClass] = useState<ClassType | null>(null);
  const [instructors, setInstructors] = useState<Instructor[] | undefined>([]);
  const [children, setChildren] = useState<Child[] | undefined>([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const instructors = await getInstructors();
        setInstructors(instructors);
      } catch (error) {
        console.error(error);
      }
    };

    fetchInstructors();
  }, []);

  useEffect(() => {
    const fetchChildrenByCustomerId = async (customerId: number) => {
      try {
        const children = await getChildrenByCustomerId(customerId);
        setChildren(children);
      } catch (error) {
        console.error(error);
      }
    };

    fetchChildrenByCustomerId(customerId);
  }, [customerId]);

  useEffect(() => {
    const fetchClassById = async (id: number) => {
      try {
        const editedClass = await getClassById(id);
        setEditedClass(editedClass);
      } catch (error) {
        console.error("Failed to fetch class:", error);
      }
    };
    fetchClassById(classId);
  }, [classId]);

  return (
    <div>
      <div>
        <h1>Edit Class</h1>
      </div>
      {instructors && children && editedClass ? (
        <EditClassForm
          customerId={customerId}
          instructors={instructors}
          editedClass={editedClass}
          isAdminAuthenticated={isAdminAuthenticated}
        >
          {children}
        </EditClassForm>
      ) : (
        <div>Loading ...</div>
      )}
    </div>
  );
}

export default RescheduleClass;
