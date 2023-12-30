import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Keys } from '@progress/kendo-angular-common';
import { AddEvent, CancelEvent, CellClickEvent, CellCloseEvent, EditEvent, GridComponent, GridDataResult, RemoveEvent, SaveEvent } from '@progress/kendo-angular-grid';
import { ToastrService } from 'ngx-toastr';
import { Observable, map } from 'rxjs';
import { User } from 'src/app/models/User';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    isAdmin !: any;
    public _userService !: UserService;
    public gridUser: User[] = []
    public gridData: any;
    public changes = {};
    public grid: any;
    public formGroup!: FormGroup;
    private editedRowIndex!: number;
    //PopUp
    showAddPopup = false;
    addUserForm!: FormGroup;

    isSelectedUser !: number;
    showDeletePopup : any;
    deleteUser !: FormGroup;
    constructor(private userService: UserService, private formBuilder: FormBuilder, private login: LoginService, private toaster: ToastrService,) {
        this.addUserForm = this.formBuilder.group({
            userId: [null],
            username: ['', Validators.required],
            password: ['', Validators.required],
            role: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            status: ['', Validators.required]
        });
        this.deleteUser = this.formBuilder.group({});
    }


    ngOnInit(): void {
        this._userService = this.userService;

        this.userService.getUser().subscribe({
            next: data => {
                this.gridUser = data;
                this.login.isLoged.next(true);
                let token = this.login.getinfo();
                if (token.role === "Admin") {
                    this.isAdmin = true;
                    this.login.isAdmin.next(true);
                }
            },
            error: error => {
                console.log(error)
            }
        })
        this.userService.read();
    }
    cellClickHandler(args: CellClickEvent) {
        if (!args.isEdited) {
            args.sender.editCell(
                args.rowIndex,
                args.columnIndex,
                this.createFormGroup(args.dataItem)
            );
        }
    }

    public editHandler(args: EditEvent): void {
        // define all editable fields validators and default values
        const { dataItem } = args;
        this.closeEditor(args.sender);

        this.formGroup = new FormGroup({
            userName: new FormControl(dataItem.userName),
            role: new FormControl(dataItem.role, Validators.required),
            phoneNumber: new FormControl(dataItem.phoneNumber),
            status: new FormControl(dataItem.status, Validators.required),     
        });

        this.editedRowIndex = args.rowIndex;
        // put the row in edit mode, with the `FormGroup` build above
        args.sender.editRow(args.rowIndex, this.formGroup);
    }

    private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
        // close the editor
        grid.closeRow(rowIndex);
        // reset the helpers
        this.editedRowIndex = -1;
    }

    public cellCloseHandler(args: CellCloseEvent): void {
        const { formGroup, dataItem } = args;

        if (!formGroup.valid) {
            args.preventDefault();
        } else if (formGroup.dirty) {
            if (args.originalEvent && args.originalEvent.keyCode === Keys.Escape) {
                return;
            }

            this.userService.assignValues(dataItem, formGroup.value);
            this.userService.update(dataItem);
        }
    }

    public addHandler(args: AddEvent): void {
        this.openAddPopup();
    }

    public cancelHandler(args: CancelEvent): void {
        args.sender.closeRow(args.rowIndex);
    }

    public saveHandler(args: SaveEvent): void {
        if (args.formGroup.valid) {
            this.userService.UpdateUser(args.formGroup.value, args.dataItem.userId).subscribe({
                next :data =>{
                    if(data) {
                        this.userService.getUser().subscribe(res => this.gridUser = res);
                        args.sender.closeRow(args.rowIndex);
                        this.toaster.success("Update success");
                    }
                }
            });
        }
    }

    public createFormGroup(dataItem: User): FormGroup {
        return this.formBuilder.group({
            userName: [dataItem.userName, Validators.required],
            role: dataItem.role,
            phoneNumber: [dataItem.phoneNumber, Validators.compose([Validators.required])],
            status: dataItem.status
        });
    }

    public saveChanges(grid: GridComponent): void {
        grid.closeCell();
        grid.cancelCell();

    }

    public cancelChanges(grid: GridComponent): void {
        grid.cancelCell();

        this.userService.cancelChanges();
    }

    // PopUp
    openAddPopup() {
        this.showAddPopup = true;
    }

    closePopup() {
        this.showAddPopup = false;
        this.showDeletePopup = false;
    }

    onSubmit() {
        if (this.addUserForm.valid) {
            const formData: User = {
                userId: 0,
                userName: this.addUserForm.get('username')?.value,
                password: this.addUserForm.get('password')?.value,
                role: this.addUserForm.get('role')?.value,
                phoneNumber: this.addUserForm.get('phoneNumber')?.value,
                status: this.addUserForm.get('status')?.value,
            };
            this.userService.create(formData);
            this.closePopup();

            this.gridUser.push(formData);

            this.userService.CreateUser("Create", formData).subscribe(
                (createdUser) => {
                },
                (error) => {
                    console.error("Error creating user:", error);
                }
            );
        }
    }

    
    public removeHandler(args: RemoveEvent): void {
        this.showDeletePopup = true;
        this.isSelectedUser = args.dataItem.userId;
      }

    onSubmitDelete() {
        this.userService.deleteUser("Delete", this.isSelectedUser).subscribe(
            (isDeleted) => {
                this.userService.getUser().subscribe(res => this.gridUser = res)
                this.closePopup();
            },
            (error) => {
                console.error("Error deleting user:", error);
            }
        );
    }
}