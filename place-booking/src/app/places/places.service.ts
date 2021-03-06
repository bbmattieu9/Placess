// Angular libraries and packages
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


// RxJs
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

// local imports
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';


interface PlaceData {
  id: string;
  availableFrom: any;
  availableTo: any;
  description: string;
  imageUrl: string;
  location: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private authService: AuthService,
              private http: HttpClient) { }

  places$: Observable<Place[]>;
  placeData: any;

  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  getPlaceById(placeId: string) {
    return this.http.get<PlaceData>(`https://ionic5-airbnbapp.firebaseio.com/offered-places/${placeId}.json`).pipe(
     map(placeData => {
       console.log('Here is place data: ', placeData);
       this.placeData = placeData;
       return new Place(
         placeId,
         this.placeData.title,
         this.placeData.description,
         this.placeData.imageUrl,
         this.placeData.price,
         placeData.location,
         this.placeData.availableFrom,
         this.placeData.availableTo,
         this.placeData.userId
        );
     })
    );
  }

  fetchPlaces() {
    return this.http.get('https://ionic5-airbnbapp.firebaseio.com/offered-places.json').pipe(
      map(resData => {
        // console.log('Finding missing Data?', resData);
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                resData[key].location,
                resData[key].availableFrom,
                resData[key].availableTo,
                resData[key].userId
              )
            );
          }
        }
        return places;
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  addPlace(
        id ,
        title,
        description,
        imageUrl,
        price,
        location,
        dateFrom,
        dateTo,
        userId) {
          let generatedId: string;
          const newPlace = new Place(id, title, description, imageUrl, price, location, dateFrom, dateTo, userId);
          return this.http.post<{name: string}>('https://ionic5-airbnbapp.firebaseio.com/offered-places.json',
          { ...newPlace, id: null}).pipe(
      switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let allPlacesArr: Place[];
    return this.places.pipe(
      take(1),
      switchMap(arrOfplaces => {
      if (!arrOfplaces || arrOfplaces.length <= 0) {
          return this.fetchPlaces();
         } else {
           return of(arrOfplaces);
         }
    }),
    switchMap(arrOfplaces => {
      const updatePlaceIndex = arrOfplaces.findIndex(pl => pl.id === placeId);
      allPlacesArr = [...arrOfplaces];
      const placeToUpdate = allPlacesArr[updatePlaceIndex];
      allPlacesArr[updatePlaceIndex] = new Place(
              placeToUpdate.id,
              title,
              description,
              placeToUpdate.imageUrl,
              placeToUpdate.price,
              placeToUpdate.location,
              placeToUpdate.availableFrom,
              placeToUpdate.availableTo,
              placeToUpdate.userId
            );
      return this.http.put(`https://ionic5-airbnbapp.firebaseio.com/offered-places/${placeId}.json`,
            {...allPlacesArr[updatePlaceIndex], id: null});
    }),
    tap(() => {
      this._places.next(allPlacesArr);
    })
    );
  }

  deletePlaceById(placeId: string) {
    return this.places.pipe(take(1), // return all the places record asObservable but take (1)
                            delay(1000), // delay it for a sec for spinner to load
                                  tap(places => { // tap into the returned bigObject and filter out the place
                                                  // you wish to update
                                                  // using the Index of the 'wanted' record
            const placeToDelete = placeId;
            const placesAfterDeleteOne = places.filter(aPlace => aPlace !== placeToDelete);
            this._places.next(placesAfterDeleteOne);
    }));
  }


}
