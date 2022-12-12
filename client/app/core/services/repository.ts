import PouchDB from 'pouchdb';
import { from, Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { DbModel } from '../models';
import { ConsoleLoggerService, Logger } from './console.logger.service';


export class Repository<T extends DbModel> {

    
  private readonly dbName: string;
  private readonly db: PouchDB.Database<T>;
  private readonly logger: Logger;

  constructor(
    logger: Logger,
    dbName: string
  ) {
    this.dbName = dbName;
    this.logger = logger;
    this.db = new PouchDB(dbName);
  }

  getById(id: string): Observable<T> {
    this.logger.debug(`getById with ${id} on ${this.dbName}`);
    return from(this.db.get(id));
  }

  get(withNoActive?: boolean): Observable<T[]> {
    this.logger.debug(`get with ${withNoActive} on ${this.dbName}`);
    return new Observable<Array<T>>((obs) => {
      const docs = this.db
        .find({
          selector: withNoActive === true ? {} : { isActive: true },
        })
        .then((docs) => {
          obs.next(docs.docs.map((x) => x));
          obs.complete();
        })
        .catch((err) => {
          obs.error(err);
        });
    });
  }

  set(items: T[], factoryId: () => string, clone: (org: T, newV: T) => void): Observable<T[]> {
    return this.get(true)
    .pipe(
      map(readItems => {
        readItems.forEach(e => e._deleted = true);
        items.forEach(it => {
          let t = readItems.find(p => p._id == it._id); 
          if (t) {
            t._deleted = false;
            clone(t, it);            
          } else {
            it._id ??= factoryId();
            it._rev = undefined;
            readItems.push(it);
          }           
        });
        return readItems;
      }),
      map(readItems => { 
        return this.db.bulkDocs(readItems);
      }),
      mergeMap(x => {
        return this.get(true)
      })
    );
  }

  changeActive(id: string, isActive: boolean = false): Observable<string | undefined> {
    this.logger.debug(`changeActive with ${id}, ${isActive} on ${this.dbName}`);
    const checkpoint = from(this.db.get<T>(id))
      .pipe(
        mergeMap(checkpoint => {
          checkpoint.isActive = isActive;
          return this.db.put(checkpoint);
        }),
        map(x => x.ok ? x.rev : undefined)
      );
    return checkpoint;
  }

  update(item: T) : Observable<string | undefined> {
    this.logger.debug(`update with ${item._id} on ${this.dbName}`);
    return from(this.db.put(item))
      .pipe(map(x => x.ok ? x.id : undefined))
  }

  updateAll(items: T[]): Observable<boolean> {
    return from(this.db.bulkDocs(items))
      .pipe(
        map(x => true)
      );
  }
}
