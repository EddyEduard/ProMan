import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public authLogin = new FormGroup({
    email: new FormControl("", Validators.compose([Validators.required, Validators.email])),
    password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)]))
  });

  // Get login email value.
  get loginEmail() {
    return this.authLogin.get("email");
  }

  // Get login password value.
  get loginPassword() {
    return this.authLogin.get("password");
  }

  public submittedLogin: boolean = false;
  public isValidForm: boolean = false;
  public isSuccessLogin: boolean = false;
  public message: string = "";

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  // Sign in account.
  async signIn() {
    this.submittedLogin = true;

    if (this.authLogin.valid) {
      const body = {
        email: this.loginEmail?.value,
        password: this.loginPassword?.value
      }
      const headers = new HttpHeaders({
        "Content-Type": "application/json",
        "Accept": "application/json"
      });

      this.isValidForm = true;

      await this.http.post(API_URL + "/auth/login", body, { headers: headers })
        .pipe(
          map(data => {
            const result = data as { token: string };
            sessionStorage.setItem("token", result.token);
          })
        ).subscribe({
          complete: () => {
            window.location.href = "/workspace/account";
          }, error: (error: HttpErrorResponse) => {
            this.isSuccessLogin = false;
            this.isValidForm = false;
            this.message = error.error != undefined ? error.error : "Failed login!";
          }
        });
    }
  }
}
