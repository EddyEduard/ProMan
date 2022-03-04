import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;

@Component({
  selector: 'workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {
  public username: string = "";

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    const token = sessionStorage.getItem("token");
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    });

    await this.http.get(API_URL + "/auth/account_profile", { headers: headers })
      .pipe(
        map(user => {
          this.username = (user as { username: string }).username;
        })
      ).subscribe();
  }

  // Sign out.
  signOut() {
    sessionStorage.removeItem("token");
    window.location.href = "/auth/login";
  }
}
