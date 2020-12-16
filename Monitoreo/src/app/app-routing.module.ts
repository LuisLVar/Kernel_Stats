import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CpuComponent } from './components/cpu/cpu.component';
import { HomeComponent } from './components/home/home.component';
import { RamComponent } from './components/ram/ram.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'ram',
    component: RamComponent
  },
  {
    path: 'cpu',
    component: CpuComponent
  },
  {
    path: "**",
    redirectTo: '/home',
    pathMatch: 'full'
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
