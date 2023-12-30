// search.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, zip } from 'rxjs';
import { User } from '../models/User';
import { environment } from 'src/environments/environment';

const CREATE_ACTION = 'Create';
const UPDATE_ACTION = 'Update';
const DELETE_ACTION = 'Delete';

const itemIndex = (item: User, data: User[]): number => {
    for (let idx = 0; idx < data.length; idx++) {
        if (data[idx].userId === item.userId) {
            return idx;
        }
    }

    return -1;
};

const cloneData = (data: User[]) => data.map(item => Object.assign({}, item));

@Injectable({
  providedIn: 'root'
})
export class UserService extends BehaviorSubject<unknown[]> {
    public url = "Users"
    private data: User[] = [];
    private originalData: User[] = [];
    private createdItems!: User;
    private updatedItems: User[] = [];
    private deletedItems!: number;
    constructor(private http : HttpClient) {
        super([]);
    }

    getUser() : Observable<User[]> {
        return this.http.get<User[]>(`${environment.apiUrl}${this.url}`)
    }
    public read(): void {
        if (this.data.length) {
            return super.next(this.data);
        }

        this.fetch()
            .subscribe(data => {
                this.data = data;
                this.originalData = cloneData(data);
                super.next(data);
            });
    }

    public create(item: User): void {
        this.data.unshift(item);
        this.createdItems = item;

        super.next(this.data);
    }

    public update(item: User): void {
        if (!this.isNew(item)) {
            const index = itemIndex(item, this.updatedItems);
            if (index !== -1) {
                this.updatedItems.splice(index, 1, item);
            } else {
                this.updatedItems.push(item);
            }
        } 
    }

    public remove(item: User): void {
        let index = itemIndex(item, this.data);
        this.data.splice(index, 1);

        index = itemIndex(item, this.updatedItems);
        if (index >= 0) {
            this.updatedItems.splice(index, 1);
        }

        super.next(this.data);
    }

    public isNew(item: User): boolean {
        return !item.userId;
    }

    public hasChanges(): boolean {
        return Boolean(this.deletedItems || this.updatedItems.length || this.createdItems);
    }

    public cancelChanges(): void {
        this.reset();

        this.data = this.originalData;
        this.originalData = cloneData(this.originalData);
        super.next(this.data);
    }

    public assignValues(target: object, source: object): void {
        Object.assign(target, source);
    }   

    private reset() {
        this.data = [];
        this.deletedItems = 0;
        this.updatedItems = [];
        this.createdItems = new User();
    }

    deleteUser(action = '', data?: number) {
        const url = `${environment.apiUrl}${this.url}/${action}/${data}`;

        return this.http.get(url)
    }

    UpdateUser(data: User, userId : number) {
        data.userId = userId;
        const url = `${environment.apiUrl}${this.url}/Update`;
        return this.http.post(url, data);
    }

    CreateUser(action = '', data?: User): Observable<User> {
        const url = `${environment.apiUrl}${this.url}/${action}`;

        return this.http.post(url, data).pipe(map(res => <User>res));
    }

    private fetch(action = '', data?: User[]): Observable<User[]> {
        return this.http
            .jsonp(`${environment.apiUrl}${action}?${this.serializeModels(data)}`, 'callback')
            .pipe(map(res => <User[]>res));
    }

    private serializeModels(data?: User[]): string {
        return data ? `&models=${JSON.stringify(data)}` : '';
    }  
}
