import Swal from "sweetalert2";

export const sweetAlert: (settings: AlertOptions) => Promise<boolean> = (
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
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  });
  return result;
};
