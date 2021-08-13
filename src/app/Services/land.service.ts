import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LandResponse } from '../Models/Land';

@Injectable({
  providedIn: 'root',
})
export class LandService {
  API_URI = 'https://backend-farm.plantvsundead.com/land';

  constructor(private http: HttpClient) {}

  getAddressByCoordenada(x: string, y: string, token: string) {
    return this.http.get<LandResponse>(`${this.API_URI}/${x}/${y}`, {
      headers: { authorization: token },
    });
  }
}
