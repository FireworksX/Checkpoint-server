export const generateCode = () => {
  return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000); //(Number(phone.slice(0, 2) + phone.slice(-2)) * 13).toString().slice(0, 4);
};
