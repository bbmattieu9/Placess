import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/create-booking/booking.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  place: Place;
  isBookable = false;
  private placeSub: Subscription;

  constructor(private route: ActivatedRoute,
              private navCtrl: NavController,
              private placesSrv: PlacesService,
              private modalCtrl: ModalController,
              private actionSheetCtrl: ActionSheetController,
              private bookingSrv: BookingService,
              private loadingCtrl: LoadingController,
              private authService: AuthService) { }

  ngOnInit() {
      this.route.paramMap.subscribe(paramMap => {
        if (!paramMap.has('placeId')) {
          this.navCtrl.navigateBack('/places/tabs/discover');
          return;
        }
        this.placeSub = this.placesSrv.getPlaceById(paramMap.get('placeId')).subscribe(singlePlace => {
          this.place = singlePlace;
          this.isBookable = singlePlace.userId !== this.authService.userId;
        });
      });
  }

  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');

          }
        },
        {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData => {
      // console.log(resultData.data, resultData.role);
      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({
          message: 'Loading Place...'
        }).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingSrv.addBooking(
           this.place.id,
           this.place.title,
           this.place.imageUrl,
           data.firstName,
           data.lastName,
           data.guestNumber,
           data.startDate,
           data.endDate
           ).subscribe(() => { loadingEl.dismiss();
          });
        });
       }
    });
  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
