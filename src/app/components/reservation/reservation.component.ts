import { Component, ElementRef, Injector, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { StringFilterCellComponent } from '@progress/kendo-angular-grid';
import { CompactType, DisplayGrid, GridType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterItemComponentInterface } from 'angular-gridster2';
import * as moment from 'moment';
import { NgToastComponent, NgToastService } from 'ng-angular-popup';
import { ToastrService } from 'ngx-toastr';
import { Reservation } from 'src/app/models/Reservation';
import { GetTimeList, Restaurant, TimeList } from 'src/app/models/Restaurant';
import { DeleteTable, RestaurantMap } from 'src/app/models/RestaurantMap';
import { PeopleOptions, TableSize } from 'src/app/models/enum/People';
import { ReservationData } from 'src/app/models/modelRequest/ReservationData';
import { LoginService } from 'src/app/services/login.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { RestaurantService } from 'src/app/services/restaurant.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  options !: GridsterConfig;
  dashboard!: GridsterItem[];
  itemToPush!: GridsterItemComponent;
  form!: FormGroup;
  minValue: { hour: number, minute: number } = { hour: 0, minute: 0 }; // Example: Set the minimum time to 00:00
  maxValue: { hour: number, minute: number } = { hour: 24, minute: 0 }; // Example: Set the minimum time to 00:00
  selectedTime: string = '';
  selected !: string;
  selectedPeople: PeopleOptions | null = PeopleOptions.None;

  peopleOptions = PeopleOptions;
  selectedRestaurant !: string;
  selectedRestaurantId !: number;
  restaurantList: Restaurant[] = [];
  timeList: TimeList[] = [];

  minDate: Date;
  selectedDate: Date = new Date();;

  isSelectTable = false;
  clickedItemId!: number;
  selectedItem: any = null;
  listWidget : any;

  isAdmin: any;
  isFind = false;

  constructor(
    injector: Injector,
    private toastService: ToastrService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private restaurantService: RestaurantService,
    private login: LoginService,
    private reservationService: ReservationService,
    private router: Router) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.login.isLoged.next(true);
    let token = this.login.getinfo();
    if (token.role === "Admin") {
      this.isAdmin = true;
      this.login.isAdmin.next(true);
    }
    this.restaurantService.getRestaurantList().subscribe({
      next: data => {
        this.restaurantList = data;
      }
    })

    this.getOptions();
    this.generateTimeList();
  }

  getOptions() {
    this.options = {
      gridType: GridType.Fixed,
      compactType: CompactType.None,
      emptyCellClickCallback: this.emptyCellClick.bind(this),
      enableEmptyCellClick: this.isAdmin ? true : false,
      pushItems: this.isAdmin ? true : false,
      draggable: {
        enabled: this.isAdmin ? true : false,
        stop: (item, event) => {
          of(true).pipe(delay(1)).subscribe(() => {
            this.saveMap();
          });
        }
      },
      resizable: {
        enabled: this.isAdmin ? true : false,
        stop: (item, event) => {
          of(true).pipe(delay(1)).subscribe(() => {
            this.saveMap();
          });
        }
      },
      displayGrid: this.isAdmin ? DisplayGrid.Always : DisplayGrid.None
    };
  }

  initItem(item: GridsterItem, itemComponent: GridsterItemComponent): void {
    this.itemToPush = itemComponent;
  }

  removeItem($event: MouseEvent | TouchEvent, item: any): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dashboard.splice(this.dashboard.indexOf(item), 1);

    let restaurantId = this.findRestaurantId(this.selectedRestaurant);
    let token = this.login.getinfo();

    let model: DeleteTable = {
      restaurantId: restaurantId,
      tableId: item['tableId'],
      userId: token.nameid
    }

    this.restaurantService.removeTable(model).subscribe({
      next: data => {
        if (data) this.toastService.success("Removed!");
      }
    })
  }

  emptyCellClick(event: MouseEvent, item: GridsterItem): void {
    let token = this.login.getinfo();
    let tableId = this.dashboard.length + 1;

    this.dashboard.push({ x: item.x, y: item.y, cols: item.cols, rows: item.rows, available: true, tableId: tableId });

    let restaurantId = this.findRestaurantId(this.selectedRestaurant);

    let map: RestaurantMap = {
      userId: token.nameid,
      restaurantId: restaurantId,
      cols: item.cols,
      rows: item.rows,
      positionX: item.x,
      positionY: item.y,
      isAvailable: true,
      tableId: tableId
    };

    this.restaurantService.addNewTable(map).subscribe({
      next: data => {
        if (data) this.toastService.success("Add Successfully!")
      }
    });
  }

  itemClick(item: any) {
    if (this.selectedItem === item) {
      this.selectedItem = null;
    } else {
      this.selectedItem = item;
    }
  }

  handleTimeSelection(): void {
    console.log('Selected time:', this.selectedTime);
  }

  generateTimeList(): void {
    const currentTime = new Date();
    const formattedDate = currentTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let restaurantId = this.findRestaurantId(this.selectedRestaurant);

    let getTimeList: GetTimeList = {
      restaurantId: restaurantId,
      reservationDate: formattedDate
    }
    this.reservationService.getTimeList(getTimeList).subscribe({
      next: data => {
        this.timeList = [];
        data.forEach(item => {
          this.timeList.push({ time: item.time, available: item.available });
        })
      }
    })
  }


  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getNumberPeopleType(people: PeopleOptions | null) {
    if (!people) {
      return 0;
    }

    if (people === PeopleOptions.LessThan2) return 1;
    else if (people === PeopleOptions.MoreThan4) return 3;
    else if (people === PeopleOptions.ThreeToFour) return 2;
    else return 0;
  }

  getRestaurantMap(): void {
    let numberPeople = this.getNumberPeopleType(this.selectedPeople);
    const formattedDate = this.selectedDate?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let selectedRestaurantId = this.findRestaurantId(this.selectedRestaurant);

    const formData: ReservationData = {
      restaurantId: selectedRestaurantId,
      numberPeople: numberPeople,
      reservationDate: formattedDate,
      reservationTime: this.selectedTime
    };

    this.restaurantService.getRestaurantMap(formData).subscribe({
      next: data => {
        if (data.length != 0 || this.isAdmin) {
          this.isSelectTable = true;
        } `  `
        this.dashboard = [];

        for (let i = 0; i < data.length; i++) {
          this.dashboard.push({ x: data[i].positionX, y: data[i].positionY, cols: data[i].cols, rows: data[i].rows, available: !data[i].isAvailable, tableId: data[i].tableId });
        }
        console.log(this.dashboard)
      }
    })

  }

  findRestaurantId(restaurantName: string): number {
    const foundRestaurant = this.restaurantList.find(item => item.restaurantName === restaurantName);

    if (foundRestaurant) {
      return foundRestaurant.restaurantId;
    }

    return 0;
  }



  saveMap() {
    let token = this.login.getinfo();
    let restaurantMaps: RestaurantMap[] = [];
    let restaurantId = this.findRestaurantId(this.selectedRestaurant);
    console.log(this.dashboard)
    this.dashboard.forEach(item => {
      let maps: RestaurantMap = {
        userId: token.nameid,
        restaurantId: restaurantId,
        cols: item.cols,
        rows: item.rows,
        positionX: item.x,
        positionY: item.y,
        isAvailable: true,
        tableId: item['tableId']
      };

      restaurantMaps.push(maps);
    });
    this.restaurantService.updateMaps(restaurantMaps).subscribe({
      next: data => {
        this.toastService.success("Updated Restaurant Map")
      }
    })
  }

  onDateChange(event: any): void {
    const selectedDate = new Date(event);
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let restaurantId = this.findRestaurantId(this.selectedRestaurant);

    let getTimeList: GetTimeList = {
      restaurantId: restaurantId,
      reservationDate: formattedDate
    }
    this.reservationService.getTimeList(getTimeList).subscribe({
      next: data => {
        this.timeList = [];
        this.selectedTime = "";
        data.forEach(item => {
          this.timeList.push({ time: item.time, available: item.available });
        })
      }
    })
  }

  makeReservation() {
    let model = this.buildModelReservation();

    this.reservationService.makeReservation(model).subscribe({
      next: data => {
        if (data) {
          this.toastService.success('Reservation Success');
          this.router.navigate(['product'])
        }
      }
    })
  }

  buildModelReservation() {
    let token = this.login.getinfo();
    let numberPeople = this.getNumberPeopleType(this.selectedPeople);
    const formattedDate = this.selectedDate?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let selectedRestaurantId = this.findRestaurantId(this.selectedRestaurant);
    let model: Reservation = {
      userID: token.nameid,
      restaurantID: selectedRestaurantId,
      numberOfCustomer: numberPeople,
      dateReservation: formattedDate,
      timeReservation: this.selectedTime,
      positionX: this.selectedItem.x,
      positionY: this.selectedItem.y
    }
    return model;
  }

  getTableSizeImage(item: any): string {
    if (item.cols === 1 && item.rows === 1) {
      return TableSize.Lessthan2;
    } else if (item.cols === 2 && item.rows === 1 || item.cols === 1 && item.rows === 2) {
      return TableSize.ThreeToFour;
    } else if (item.cols === 2 && item.rows === 2) {
      return TableSize.MoreThan4;
    } else {
      return TableSize.Error;
    }
  }

  onPeopleSelectionChange() {
    this.isFind = true;
    if (this.isFind) {
      this.getRestaurantMap();
    }
  }

  onRestaurantSelectionChange() {
    this.isFind = true;
    if (this.isFind) {
      this.getRestaurantMap();
    }
  }

}
