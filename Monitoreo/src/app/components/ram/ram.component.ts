import { Component, OnInit } from '@angular/core';
import { MonitorService } from 'src/app/services/monitor.service';

@Component({
  selector: 'app-ram',
  templateUrl: './ram.component.html',
  styleUrls: ['./ram.component.css']
})

export class RamComponent implements OnInit {
  
  data : any = "...";

  constructor(private monitorService: MonitorService) {
      monitorService.data.subscribe((msg :any) => {
      //console.log("Response from websocket: " + msg);
      //console.log(typeof(msg));
      const regex = /"/g;
      const regex2 = /'/g;
      let json : string = msg.replace(regex, '').replace(regex2, '\"');
      console.log(json);
      let data : any = {};
      try{
        data = JSON.parse(json);
        console.log(data);
      }catch(err){
        console.log(err)
      } 
     
      
      //console.log(json.slice(0, -1).length);
      //console.log(json.slice(0, -1));
      //let salida = `{"usedRam":2717437, "totalRam":4061913, "usedCpu":0.25}`;
      
      //console.log(salida.length);
      //console.log(datos);
      //let data = JSON.parse(datos);
      //console.log(data);
      //console.log(data);W
      this.data = data;
    });
   }

   sendMsg() {
    console.log("new message from client to websocket.");
    this.monitorService.data.next('ram');
  }


  ngOnInit(): void {
  }

}
