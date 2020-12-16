import { Component, OnInit } from '@angular/core';
import { MonitorService } from 'src/app/services/monitor.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-ram',
  templateUrl: './ram.component.html',
  styleUrls: ['./ram.component.css']
})

export class RamComponent implements OnInit {

  data: any = "...";
  porcentaje: any = 0;
  porcentajes: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(private monitorService: MonitorService) {
    monitorService.data.subscribe((msg: any) => {
      const regex = /"/g;
      const regex2 = /'/g;
      let json: string = msg.replace(regex, '').replace(regex2, '\"');
      console.log(json);
      let data: any = {};
      try {
        data = JSON.parse(json);
        console.log(data);
        this.porcentaje = ((parseFloat(data.usedRam) / parseFloat(data.totalRam)) * 100).toFixed(2);
        this.porcentajes.shift();
        this.porcentajes.push(this.porcentaje);
        this.chart.data.datasets[0].data = this.porcentajes;
        this.chart.update();
        console.log(this.porcentajes);
      } catch (err) {
        console.log(err)
      }
      //let salida = `{"usedRam":2717437, "totalRam":4061913}`;
      this.data = data;
    });
  }

  sendMsg() {
    console.log("new message from client to websocket.");
    this.monitorService.data.next('ram');
  }

  //Chart JS

  chart: any = null;



  ngOnInit(): void {
    this.chart = new Chart('realtime', {
      type: 'line',
      data: {
        datasets: [{
          data: [],
          label: '% RAM',
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
