export interface Config {
  REACT_APP_BASE_URL: string;
  REACT_APP_API_URL: string;
  REACT_APP_OAUTH_CLIENT_ID: string;
}

const config: Config = {
  REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL || '',
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
  REACT_APP_OAUTH_CLIENT_ID: process.env.REACT_APP_OAUTH_CLIENT_ID || ''
};

export default config;
