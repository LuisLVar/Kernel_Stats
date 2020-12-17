import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  API_URI = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getProcesos = () => this.http.get(`${this.API_URI}/home`);

  kill = (pid : any) => this.http.get(`${this.API_URI}/kill/${pid}`)
}
