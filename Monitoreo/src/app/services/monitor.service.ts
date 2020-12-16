import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs/Rx";
import { WebsocketService } from "./websocket.service";

const URL = "ws://localhost:8080/ws";

@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  public data : any;

  constructor(wsService: WebsocketService) { 
    this.data = <Subject<any>>wsService.connect(URL).map(
      (response: MessageEvent): any => {
        //let mensaje = JSON.parse(response.data);
        //console.log(response.data);
        return response.data;
      }
    );
  }


}
