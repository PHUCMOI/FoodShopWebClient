import { Component, OnInit } from '@angular/core';
import { SeriesLabelsContentArgs } from '@progress/kendo-angular-charts';
import { IntlService } from '@progress/kendo-angular-intl';
import { BarChartCategory } from 'src/app/models/Chart';
import { Dashboard } from 'src/app/models/Dashboard';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isAdmin !: any;
  pieData !: any;
  barDataCategory !: any;
  dashboardData !: any;
  categories: string[] = [];
  counts: number[] = [];
  constructor(private intl: IntlService,
    private dashboardService: DashboardService,
    private login: LoginService) {
    this.labelContent = this.labelContent.bind(this);
  }

  ngOnInit(): void {
    this.dashboardService.getPieChartData().subscribe({
      next: data => {
        this.pieData = data;
        this.login.isLoged.next(true);
        let token = this.login.getinfo();
        if (token.role === "Admin") {
          this.isAdmin = true;
          this.login.isAdmin.next(true);
        }
      }
    })
    this.dashboardService.getBarChartCategoryData().subscribe({
      next: data => {
        this.barDataCategory = data;
        this.barDataCategory.forEach((item: BarChartCategory) => {
          this.categories.push(item.category);
          this.counts.push(item.totalQuantity);
        });
      }
    })
    this.dashboardService.getDashboardData().subscribe({
      next : data => {
        this.dashboardData = data;
        console.log(this.dashboardData.topCustomer)
      }
    })
  }

  public labelContent(args: SeriesLabelsContentArgs): string {
    const percentage = Math.round(args.dataItem.value * 1000); // Convert to a whole number
    return `${args.dataItem.category} : ${this.intl.formatNumber(percentage, 'n0')}%`;
  }

}