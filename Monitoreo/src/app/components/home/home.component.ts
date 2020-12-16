import { Component, OnInit } from '@angular/core';
import { WebsocketService } from "../../services/websocket.service";
import { MonitorService } from "../../services/monitor.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  data : any = "...";

  constructor(private monitorService: MonitorService) {
    monitorService.data.subscribe((msg :any) => {
      console.log("Response from websocket: " + msg);
      this.data = msg;
    });
   }


   sendMsg() {
    console.log("new message from client to websocket.");
    this.monitorService.data.next('home');
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
    this.monitorService.data.next('home');
  }

}
