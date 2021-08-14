import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { PlantResponse } from '../Models/Plant';


@Injectable({
    providedIn: 'root'
})

export class PlantsService {

    API_URI = 'https://backend-farm.plantvsundead.com/farms/other';

    constructor(private http: HttpClient) { }

    getPlantsByAddress(limit: string, offset: string, address: string, token: string) {
        return this.http.get<PlantResponse>(`${this.API_URI}/${address}`,
            { params: { limit, offset }, headers: { 'authorization': token } });
    }

}