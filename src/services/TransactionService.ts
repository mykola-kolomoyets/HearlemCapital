import { AxiosResponse } from 'axios';

import { transactions } from './paths';

import api, { AuthHeader } from '../api';

import { Pageable } from '../../../shared/types/response';
import { CreateTransactionRequest, CreateTransactonResponse } from '../../../shared/types/transaction';
export default class TransactionService {
  public static create = (data: Partial<CreateTransactionRequest>): Promise<void> =>
    api.post(transactions, data, { headers: AuthHeader() });


  public static getList = (query: string): Promise<AxiosResponse<Pageable<CreateTransactonResponse>, CreateTransactonResponse[]>> =>
    api.get(`${transactions}?${query}`, { headers: AuthHeader() });
}


