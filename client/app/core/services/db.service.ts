import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

//used to initialize pouchdb db
@Injectable({
  providedIn: 'root',
})
export class DBService {
  constructor() {
    PouchDB.plugin(PouchDBFind);
  }
}
