import { AxiosResponse } from "axios";

import { users }  from "./paths";

import api, { AuthHeader } from "../api";

import { User } from "../../../shared/types/user";

export default class UserService {
  public static create = (data: User): Promise<AxiosResponse<any>> =>
    api.post(users.create, data);


  public static createByAdmin = (data: User): Promise<AxiosResponse<any>> =>
    api.post(users.createByAdmin, data, { headers: AuthHeader() });


  public static update = (data: User, id: string): Promise<AxiosResponse<any>> =>
    api.put(`${users.update}/${id}`, data, { headers: AuthHeader() });


  public static requestDeactivate = (): Promise<AxiosResponse<any>> =>
    api.post(users.requestDeactivate, {}, { headers: AuthHeader() });


  public static deactivate = (id: string): Promise<AxiosResponse<any>> =>
    api.post(`${users.deactivate}/${id}`, {}, { headers: AuthHeader() });


  public static remove = (id: string): Promise<AxiosResponse<any>> =>
    api.delete(`${users.delete}/${id}`, { headers: AuthHeader() });
}

