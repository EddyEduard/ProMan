import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IProject } from './IProject';

const API_URL = environment.apiUrl;

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  public projects!: IProject[];
  private headers!: HttpHeaders;

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    const token = sessionStorage.getItem("token");
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    });

    await this.http.get<IProject[]>(API_URL + "/project/get", { headers: this.headers })
      .pipe(
        map(projects => {
          this.projects = projects;
        })
      ).subscribe();
  }
}
