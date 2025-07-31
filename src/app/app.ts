import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BudgetDashboardComponent } from "./main/main";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BudgetDashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'HaushaltsbudgetManager';
}
