import { Component, OnInit } from '@angular/core';
import { WebsocketService } from "../../services/websocket.service";
import { MonitorService } from "../../services/monitor.service";
import { HomeService } from "../../services/home.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  data : any = "...";
  procesos: any = null;

  constructor(private monitorService: MonitorService, private homeService : HomeService) {
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
    this.getProcesos();
  }

  getProcesos(): void {
    this.homeService.getProcesos().subscribe(
      res => {
        console.log(res);
        this.procesos = res;
        console.log(this.procesos);
      },
      err => console.log(err)
    );
  }

}
