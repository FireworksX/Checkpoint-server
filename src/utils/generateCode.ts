export const generateCode = (phone: string) => {
  return (Number(phone.slice(0, 2) + phone.slice(-2)) * 13).toString().slice(0, 4);
};
