import { Investor, InvestorType } from '../../../../../shared/types/investor';

export const defaultValues: Investor = {
  type: InvestorType.NATURAL_PERSON,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bsn: '',
  address: '',
  postcode: '',
  city: '',
  kvk: '',
  companyName: ''
};

export type signUpValidationFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bsn: string;
  address: string;
  postcode: string;
  city: string;
  kvk: string;
  companyName: string;
};

export const defaultErrors: signUpValidationFields = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bsn: '',
  address: '',
  postcode: '',
  city: '',
  kvk: '',
  companyName: ''
};

export const onlyNumbersInputs = ['kvk', 'bsn'];

export const maxBSNLength = 9;
export const maxKVKLength = 8;
export const maxPhoneLength = 15;

export const signUpCancelUrl = `https://haerlemcapital.b2clogin.com/haerlemcapital.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_signupsignin1&client_id=d1cff94c-6ce2-46da-9524-1112870dac5c&nonce=defaultNonce&redirect_uri=${process.env.REACT_APP_BASE_URL}&scope=openid&response_type=id_token&prompt=login`;
