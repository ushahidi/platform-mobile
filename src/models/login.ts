export interface Login {

  user_id: number;

  user_role: string;

  username: string;

  token_type: string;

  expires: number;

  expires_in: number;

  access_token: string;

  refresh_token: string;

  refresh_token_expires_in: number;

}
