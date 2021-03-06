import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  signInForm: FormGroup;
  isLoading = false;
  isLogin = true;

  constructor(private authSrv: AuthService,
              private router: Router,
              private loadingCtrl: LoadingController) { }

  onLogin() {
    this.isLoading = true;
    this.authSrv.login();
    this.loadingCtrl.create({
      keyboardClose: true, message: 'Logging In...'
    }).then(loadingEl => {
      loadingEl.present();
      setTimeout(() => {
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
       }, 1500);
  });
  }

  onSwitchMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    if (!this.signInForm.valid) {

      // construct form object
      const email = this.signInForm.get('email').value;
      const password = this.signInForm.get('password').value;

      if (this.isLogin) {
        // Send req to login servers
      } else {
        // Send the req to signup servers
      }

    }
  }

  ngOnInit() {


    this.signInForm = new FormGroup({
      email: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(6)]
      })
    });
  }

}
