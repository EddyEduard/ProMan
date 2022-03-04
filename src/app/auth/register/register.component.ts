import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public authRegister = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    email: new FormControl("", Validators.compose([Validators.required, Validators.email])),
    phone: new FormControl("", Validators.compose([Validators.required, Validators.minLength(9), Validators.maxLength(11)])),
    industry: new FormControl("", Validators.compose([Validators.required])),
    country: new FormControl("", Validators.compose([Validators.required])),
    city: new FormControl("", Validators.compose([Validators.required])),
    address: new FormControl("", Validators.compose([Validators.required])),
    role: new FormControl("", Validators.compose([Validators.required])),
    username: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)]))
  });

  // Get register name value.
  get registerName() {
    return this.authRegister.get("name");
  }

  // Get register email value.
  get registerEmail() {
    return this.authRegister.get("email");
  }

  // Get register phone value.
  get registerPhone() {
    return this.authRegister.get("phone");
  }

  // Get register industry value.
  get registerIndustry() {
    return this.authRegister.get("industry");
  }

  // Get register country value.
  get registerCountry() {
    return this.authRegister.get("country");
  }

  // Get register city value.
  get registerCity() {
    return this.authRegister.get("city");
  }

  // Get register address value.
  get registerAddress() {
    return this.authRegister.get("address");
  }

  // Get register role value.
  get registerRole() {
    return this.authRegister.get("role");
  }

  // Get register username value.
  get registerUsername() {
    return this.authRegister.get("username");
  }

  // Get register password value.
  get registerPassword() {
    return this.authRegister.get("password");
  }

  public submittedRegister: boolean = false;
  public isValidForm: boolean = false;
  public isSuccessRegister: boolean = false;
  public message: string = "";

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  // Sign up.
  async signUp() {
    this.submittedRegister = true;

    if (this.authRegister.valid) {
      const body = {
        username: this.registerUsername?.value,
        password: this.registerPassword?.value,
        roles: [
          this.registerRole?.value
        ],
        company: {
          name: this.registerName?.value,
          email: this.registerEmail?.value,
          phone: this.registerPhone?.value,
          industry: this.registerIndustry?.value,
          country: this.registerCountry?.value,
          city: this.registerCity?.value,
          address: this.registerAddress?.value
        }
      }
      const headers = new HttpHeaders({
        "Content-Type": "application/json",
        "Accept": "application/json"
      });

      this.isValidForm = true;

      await this.http.post(API_URL + "/auth/register", body, { headers: headers }).subscribe({
        complete: () => {
          this.isSuccessRegister = true;
          this.isValidForm = false;
          this.message = "Register company successfully!Go to Sign In!";
        }, error: (error: HttpErrorResponse) => {
          this.isSuccessRegister = false;
          this.isValidForm = false;
          this.message = error.error.cause.sqlexception.message != undefined ? error.error.cause.sqlexception.message : "Failed register!";
        }
      });
    }
  }
}
