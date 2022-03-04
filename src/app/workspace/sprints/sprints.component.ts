import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Priority } from '../Priority.enum';
import { ISprint } from './ISprint';

const API_URL = environment.apiUrl;

@Component({
  selector: 'sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.css']
})
export class SprintsComponent implements OnInit {

  public highSprints!: ISprint[];
  public middleSprints!: ISprint[];
  public lowSprints!: ISprint[];
  private headers!: HttpHeaders;

  constructor(private activatedRouter: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    const token = sessionStorage.getItem("token");
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    });

    this.activatedRouter.params.pipe(
      map(async value => {
        const project_id = value["project_id"];
        await this.http.get<ISprint[]>(API_URL + "/sprint/get/" + project_id, { headers: this.headers })
          .pipe(
            map(sprints => {
              this.highSprints = sprints.filter(sprint => sprint.priority == Priority.HIGH);
              this.middleSprints = sprints.filter(sprint => sprint.priority == Priority.MIDDLE);
              this.lowSprints = sprints.filter(sprint => sprint.priority == Priority.LOW);
            })
          ).subscribe();
      })
    ).subscribe();
  }

  // Delete a sprint.
  async deleteSprint(id: number, priority: Priority) {
    const isConfirmed = confirm("Are you sure you want to delete this sprint?");

    if (isConfirmed) {
      await this.http.delete(API_URL + "/sprint/delete/" + id, { headers: this.headers })
        .subscribe({
          complete: () => {
            alert(priority);
          }
        });
    }
  }
}
