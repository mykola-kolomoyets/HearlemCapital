import { useEffect } from 'react';

const RedirectToLogin = () => {
  useEffect(() => {
    window.location.href =
      `https://haerlemcapital.b2clogin.com/haerlemcapital.onmicrosoft.com/B2C_1_signupsignin1/oauth2/v2.0/authorize?client_id=d1cff94c-6ce2-46da-9524-1112870dac5c&nonce=anyRandomValue&redirect_uri=${process.env.REACT_APP_BASE_URL}/login.html&scope=https://haerlemcapital.onmicrosoft.com/api/demo.read openid&response_type=code`;
  });

  return null;
};

export default RedirectToLogin;
