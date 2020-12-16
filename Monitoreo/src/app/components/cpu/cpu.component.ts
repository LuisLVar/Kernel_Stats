import { Component, OnInit } from '@angular/core';
import { MonitorService } from 'src/app/services/monitor.service';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css']
})
export class CpuComponent implements OnInit {

  data : any = "...";

  constructor(private monitorService: MonitorService) {
    monitorService.data.subscribe((msg :any) => {
      console.log("Response from websocket: " + msg);
      this.data = msg;
      this.monitorService.data.next('cpu');
    });

    
   }


   sendMsg() {
    console.log("new message from client to websocket.");
    this.monitorService.data.next('cpu');
  }

  ngOnInit(): void {
  }

}
