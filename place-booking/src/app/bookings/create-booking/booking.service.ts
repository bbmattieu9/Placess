import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  // tslint:disable-next-line: variable-name
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authSrv: AuthService) { }

  getBookings() {
    return this._bookings.asObservable();
  }

  addBooking(
      placeId: string,
      placeTitle: string,
      placeImage: string,
      firstName: string,
      lastName: string,
      guestNumber: number,
      dateFrom: Date,
      dateTo: Date) {
        const newBooking = new Booking(
          Math.random().toString(),
          placeId,
          this.authSrv.userId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
        return this._bookings.pipe(
          take(1),
          delay(1000),
          tap(bookings => {
            this._bookings.next(bookings.concat(newBooking));
          })
        );
       }


  cancelBooking(bookingId: string) {
    return this._bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.filter(allBookings => allBookings.id !== bookingId));
      })
    );
   }
}
