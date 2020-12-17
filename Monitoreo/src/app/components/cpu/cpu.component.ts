import { Component, OnInit } from '@angular/core';
import { MonitorService } from 'src/app/services/monitor.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css']
})
export class CpuComponent implements OnInit {

  data : any = "...";
  cpu1 : number = 0;
  cpu2 : number = 0;
  cpu3 : number = 0;
  cpu4 : number = 0;

  porcentaje: any = 0;
  porcentajes: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(private monitorService: MonitorService) {
    monitorService.data.subscribe((msg :any) => {
      console.log("Response from websocket: " + msg);
      this.data = msg;
      let cpus = (this.data.replace(/\[/g, '').replace(/\]/g, '')).split(",");
      console.log(cpus);
      if(cpus.length == 4){
        this.cpu1 = Number(parseFloat(cpus[0]).toFixed(2));
        this.cpu2 = Number(parseFloat(cpus[1]).toFixed(2));
        this.cpu3 = Number(parseFloat(cpus[2]).toFixed(2));
        this.cpu4 = Number(parseFloat(cpus[3]).toFixed(2));
        this.porcentaje = ((this.cpu1+this.cpu2+this.cpu3+this.cpu4)/4).toFixed(2);
        this.porcentajes.shift();
        this.porcentajes.push(this.porcentaje);
        this.chart.data.datasets[0].data = this.porcentajes;
        this.chart.update();
      }
      //console.log(this.data);
    });
   }


   sendMsg() {
    console.log("new message from client to websocket.");
    this.monitorService.data.next('cpu');
  }


  chart: any = null;


  ngOnInit(): void {
    this.chart = new Chart('realtime', {
      type: 'line',
      data: {
        datasets: [{
          data: [],
          label: '% CPU',
          backgroundColor: '#168ede',
          borderColor: '#168ede',
          fill: false,
          // This binds the dataset to the left y axis
          yAxisID: 'left-y-axis'
        }],
        labels: [60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0]
      },
      options: {
        scales: {
          yAxes: [{
            id: 'left-y-axis',
            type: 'linear',
            position: 'left',
            ticks: {
              min: 0,
              max: 100,
              stepSize: 10
            }
          }],
        }
      }
    });
  }

  

}
