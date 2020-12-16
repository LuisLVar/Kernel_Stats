import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { R3ExpressionFactoryMetadata } from '@angular/compiler/src/render3/r3_factory';
import { Injectable } from '@angular/core';
import * as Rx from 'rxjs/Rx'

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private subject: any;

  public connect(url : any): Rx.Subject<MessageEvent> {
    if(!this.subject){
      this.subject = this.create(url);
      console.log("Succesfully connected: ", url);
    }
    return this.subject;
  }

  private create(url : any) : Rx.Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = new Rx.Observable(
      (obs : Rx.Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      }
    )
    
    let observer = {
      next :  (data: Object) => {
        if(ws.readyState === WebSocket.OPEN){
          ws.send(JSON.stringify(data));
        }
      }
    }

    return Rx.Subject.create(observer, observable)
  }
}
