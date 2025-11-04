import Swal from "sweetalert2";

export const customAlert: (settings: AlertOptions) => Promise<boolean> = (
  settings: AlertOptions,
) => {
  const result = Swal.fire({
    title: settings.title,
    text: settings.text,
    icon: settings.icon,
    confirmButtonText: settings.confirmButtonText,
    cancelButtonText: settings.cancelButtonText,
    showCancelButton: settings.showCancelButton,
    showConfirmButton: settings.showConfirmButton,
    position: settings.position || "center",
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  });
  return result;
};

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
