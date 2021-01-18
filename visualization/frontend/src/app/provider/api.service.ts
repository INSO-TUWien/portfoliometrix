import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class ApiService {

  apiURL = 'http://localhost:5000/api';

  constructor(private httpClient: HttpClient) { }

  public get<T>(api: string, param?: {[key: string]: string|string[]}): Observable<T> {
 
    if (param) {
        return this.httpClient.get<T>(`${this.apiURL}/${api}`, {
          params: param
        });
    } else {
      return this.httpClient.get<T>(`${this.apiURL}/${api}`);
    }
  }

  /** put is used to create or overwrite new resources */
  public put<TParameter, TResult>(api: string, value: TParameter): Observable<TResult> {
    return this.httpClient.put<TResult>(`${this.apiURL}/${api}`, value);
  }

  /** post is used to update existing ones */
  public post<TParameter, TResult>(api: string, value: TParameter): Observable<TResult> {
    return this.httpClient.post<TResult>(`${this.apiURL}/${api}`, value);
  }

  public delete(api: string, params?: {[key: string]: string|string[]}): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiURL}/${api}`, {
      params
    });
  }
}
