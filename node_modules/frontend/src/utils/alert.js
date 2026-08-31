import Swal from 'sweetalert2';

const CustomSwal = Swal.mixin({
  background: '#050505',
  color: '#ffffff',
  customClass: {
    popup: 'glass-card',
    confirmButton: 'btn-primary',
    cancelButton: 'btn-ghost'
  },
  buttonsStyling: false
});

export const showError = (text) => {
  return CustomSwal.fire({
    title: 'Error',
    text: text,
    icon: 'error'
  });
};

export const showSuccess = (text) => {
  return CustomSwal.fire({
    title: 'Success',
    text: text,
    icon: 'success'
  });
};

export const showInfo = (text) => {
  return CustomSwal.fire({
    title: 'Notice',
    text: text,
    icon: 'info'
  });
};

export default CustomSwal;
