export type DeleteAccountInput = {
  confirmEmail: string;
};

export type DeleteAccountResult = {
  deleted: true;
  userId: string;
};
