import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from './IUser';

const API_URL = environment.apiUrl;
const AES_KEY = environment.aesKey;

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  public roles: Array<{ name: string, value: string, checked: boolean }> = [
    {
      name: "ADMIN",
      value: "ADMIN",
      checked: false
    },
    {
      name: "MANAGER",
      value: "MANAGER",
      checked: false
    },
    {
      name: "DIRECTOR",
      value: "DIRECTOR",
      checked: false
    },
    {
      name: "ACCOUNTANT",
      value: "ACCOUNTANT",
      checked: false
    },
    {
      name: "SPECIALIST",
      value: "SPECIALIST",
      checked: false
    }
  ];

  public profileForm = new FormGroup({
    email: new FormControl("", Validators.compose([Validators.required, Validators.email])),
    phone: new FormControl("", Validators.compose([Validators.required, Validators.minLength(9), Validators.maxLength(11)])),
    username: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)]))
  });

  // Get profile email value.
  get profileEmail() {
    return this.profileForm.get("email");
  }

  // Get profile phone value.
  get profilePhone() {
    return this.profileForm.get("phone");
  }

  // Get profile username value.
  get profileUsername() {
    return this.profileForm.get("username");
  }

  // Get profile password value.
  get profilePassword() {
    return this.profileForm.get("password");
  }

  public user!: IUser;
  public isUserUpdate: boolean = false;
  public isRoleRequired: boolean = false;
  public submittedUpdate: boolean = false;
  public isValidForm: boolean = false;
  public isSuccessUpdate: boolean = false;
  public isFailedDelete: boolean = false;
  public message: string = "";

  private headers!: HttpHeaders;

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    const token = sessionStorage.getItem("token");
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    });

    await this.http.get<IUser>(API_URL + "/auth/account_profile?decrypt_aes_key=" + AES_KEY, { headers: this.headers })
      .pipe(
        map(user => {
          this.user = user;
          this.user.hide_password = true;
          this.profileEmail?.setValue(user.email);
          this.profilePhone?.setValue(user.phone);
          this.profileUsername?.setValue(user.username);
          this.profilePassword?.setValue(user.password);

          for (let role of user.roles) {
            const roleIndex = this.roles.findIndex(x => x.value == role.name);
            if (roleIndex >= 0)
              this.roles[roleIndex].checked = true;
          }
        })
      ).subscribe();
  }

  // Save updates to profile.
  async saveUpdates() {
    this.submittedUpdate = true;
    const roles = this.roles.filter(role => role.checked == true).map(role => role.name);

    if (roles.length == 0)
      this.isRoleRequired = true;
    else {
      this.isRoleRequired = false;

      if (this.profileForm.valid) {
        const body = {
          email: this.profileEmail?.value,
          phone: this.profilePhone?.value,
          username: this.profileUsername?.value,
          password: this.profilePassword?.value,
          roles: roles
        }

        this.isValidForm = true;

        await this.http.put<IUser>(API_URL + "/auth/account_profile", body, { headers: this.headers })
          .pipe(
            map(user => {
              this.user = user;
              this.user.password = body.password;
              this.user.hide_password = true;
              this.profileEmail?.setValue(user.email);
              this.profilePhone?.setValue(user.phone);
              this.profileUsername?.setValue(user.username);
              this.profilePassword?.setValue(body.password);

              for (let role of user.roles) {
                const roleIndex = this.roles.findIndex(x => x.value == role.name);
                if (roleIndex >= 0)
                  this.roles[roleIndex].checked = true;
              }
            })
          ).subscribe({
            complete: () => {
              this.isUserUpdate = false;
              this.isSuccessUpdate = true;
              this.isValidForm = false;
              this.message = "Update account successfully!";
            }, error: (error: HttpErrorResponse) => {
              this.isSuccessUpdate = false;
              this.isValidForm = false;
              this.message = error.error != undefined ? error.error.cause.sqlexception.message : "Failed update account!";
            }
          });
      }
    }
  }

  // Delete account.
  async deleteAccount() {
    const isConfirmed = confirm("Are you sure you want to delete the account?");

    if (isConfirmed) {
      await this.http.delete(API_URL + "/auth/account_profile/" + this.user.id, { headers: this.headers }).subscribe({
        complete: () => {
          window.location.href = "/auth/login";
        }, error: () => {
          this.isFailedDelete = true;
        }
      });
    }
  }
}
