import Swal from "sweetalert2";

export const confirmAlert: (text: string) => Promise<boolean> = (
  text: string,
) => {
  const result = Swal.fire({
    text: text,
    icon: "warning",
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    showCancelButton: true,
    showConfirmButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  });
  return result;
};

export const errorAlert: (text: string) => Promise<void> = async (
  text: string,
) => {
  Swal.fire({
    text: text,
    icon: "error",
    confirmButtonText: "OK",
    showConfirmButton: true,
  });
};

export const warningAlert: (text: string) => Promise<void> = async (
  text: string,
) => {
  Swal.fire({
    text: text,
    icon: "warning",
    confirmButtonText: "OK",
    showConfirmButton: true,
  });
};
