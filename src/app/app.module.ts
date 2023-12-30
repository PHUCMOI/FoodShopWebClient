import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginService } from './services/login.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductComponent } from './components/product/product.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TokenInterceptor } from './services/interceptor.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { TreeViewComponent } from './components/treeview/treeview.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { CartComponent } from './components/cart/cart.component';
import { DetailComponent } from './components/detail/detail.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { NgToastModule } from 'ng-angular-popup';
import { ToastrModule } from 'ngx-toastr';
import { UserComponent } from './components/user/user.components';
import { MatDialogModule } from '@angular/material/dialog';
import { OrderComponent } from './components/order/order.component';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReservationComponent } from './components/reservation/reservation.component';
import { GridsterModule } from 'angular-gridster2';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import {MatSelectModule} from '@angular/material/select';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    NavbarComponent,
    ProductComponent,
    TreeViewComponent,
    CartComponent,
    DetailComponent,
    CheckoutComponent,
    UserComponent,
    OrderComponent,
    ReservationComponent
  ],
  imports: [
    BrowserAnimationsModule, 
    ToastrModule.forRoot({
      timeOut: 2000, 
      positionClass: 'toast-bottom-right', 
      preventDuplicates: true,
    }),
    NgToastModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    GridModule,
    BrowserAnimationsModule,
    TreeViewModule,
    FormsModule,
    FontAwesomeModule,
    CommonModule,
    MatDialogModule,
    ChartsModule,
    InputsModule,
    MatAutocompleteModule,
    MatInputModule,
    GridsterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    NgxMaterialTimepickerModule,
    MatSelectModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [LoginService, {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor,  multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
