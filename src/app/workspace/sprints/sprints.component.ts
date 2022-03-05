import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  public createSprintForm = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    description: new FormControl(""),
    priority: new FormControl("", Validators.compose([Validators.required]))
  });

  // Get sprint name value.
  get createSprintName() {
    return this.createSprintForm.get("name");
  }

  // Get sprint name value.
  get createSprintDescription() {
    return this.createSprintForm.get("description");
  }

  // Get sprint priority value.
  get createSprintPriority() {
    return this.createSprintForm.get("priority");
  }

  public editSprintForm = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    description: new FormControl(""),
    priority: new FormControl("", Validators.compose([Validators.required]))
  });

  // Get sprint name value.
  get editSprintName() {
    return this.editSprintForm.get("name");
  }

  // Get sprint name value.
  get editSprintDescription() {
    return this.editSprintForm.get("description");
  }

  // Get sprint priority value.
  get editSprintPriority() {
    return this.editSprintForm.get("priority");
  }

  @ViewChild("editSprintModal", { static: true }) private editSprintModal!: ElementRef<HTMLDivElement>;
  @ViewChild("createSprintModal", { static: true }) private createSprintModal!: ElementRef<HTMLDivElement>;

  public highSprints!: ISprint[];
  public middleSprints!: ISprint[];
  public lowSprints!: ISprint[];
  public sprint!: ISprint;
  public submitted: boolean = false;
  public isValidForm: boolean = false;
  public isSuccessCreateSprint: boolean = true;
  public isSuccessEditSprint: boolean = true;

  private headers!: HttpHeaders;

  constructor(private activatedRouter: ActivatedRoute, private http: HttpClient) { }

  async ngOnInit() {
    const token = sessionStorage.getItem("token");
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    });

    await this.activatedRouter.params.pipe(
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

  // Open edit sprint.
  openEditSprint(sprint: ISprint) {
    this.sprint = sprint;
    this.editSprintName?.setValue(sprint.name);
    this.editSprintDescription?.setValue(sprint.description);
    this.editSprintPriority?.setValue(sprint.priority);
    this.editSprintModal.nativeElement.style.display = "block";
  }

  // Save created sprint.
  async saveCreatedSprint() {
    this.submitted = true;

    if (this.createSprintForm.valid) {
      await this.activatedRouter.params.pipe(
        map(async value => {
          const project_id = value["project_id"];
          const body = {
            projectId: parseInt(project_id),
            name: this.createSprintName?.value,
            description: this.createSprintDescription?.value,
            priority: this.createSprintPriority?.value
          }

          this.isValidForm = true;

          await this.http.post<ISprint>(API_URL + "/sprint/create", body, { headers: this.headers })
            .pipe(
              map(sprint => {
                if (sprint.priority == Priority.HIGH)
                  this.highSprints.push(sprint);
                else if (sprint.priority == Priority.MIDDLE)
                  this.middleSprints.push(sprint);
                else if (sprint.priority == Priority.LOW)
                  this.lowSprints.push(sprint);
              })
            ).subscribe(
              {
                complete: () => {
                  this.isValidForm = false;
                  this.createSprintModal.nativeElement.style.display = "none";
                },
                error: () => {
                  this.isValidForm = false;
                  this.isSuccessCreateSprint = false;
                }
              }
            );
        })
      ).subscribe();
    }
  }

  // Save edited sprint.
  async saveEditedSprint() {
    this.submitted = true;

    if (this.editSprintForm.valid) {
      const body = {
        name: this.editSprintName?.value,
        description: this.editSprintDescription?.value,
        priority: this.editSprintPriority?.value
      }

      await this.http.put<ISprint>(API_URL + "/sprint/update/" + this.sprint.id, body, { headers: this.headers })
        .pipe(
          map(sprint => {
            if (this.sprint.priority == Priority.HIGH) {
              const index = this.highSprints.findIndex(sprint => sprint.id == sprint.id);
              this.highSprints.splice(index, 1);
            } else if (this.sprint.priority == Priority.MIDDLE) {
              const index = this.middleSprints.findIndex(sprint => sprint.id == sprint.id);
              this.middleSprints.splice(index, 1);
            } else if (this.sprint.priority == Priority.LOW) {
              const index = this.lowSprints.findIndex(sprint => sprint.id == sprint.id);
              this.lowSprints.splice(index, 1);
            }

            if (sprint.priority == Priority.HIGH)
              this.highSprints.push(sprint);
            else if (sprint.priority == Priority.MIDDLE)
              this.middleSprints.push(sprint);
            else if (sprint.priority == Priority.LOW)
              this.lowSprints.push(sprint);
          })
        ).subscribe(
          {
            complete: () => {
              this.isValidForm = false;
              this.editSprintModal.nativeElement.style.display = "none";
            },
            error: () => {
              this.isValidForm = false;
              this.isSuccessEditSprint = false;
            }
          }
        );
    }
  }

  // Delete a sprint.
  async deleteSprint(id: number, priority: Priority) {
    const isConfirmed = confirm("Are you sure you want to delete this sprint?");

    if (isConfirmed) {
      await this.http.delete(API_URL + "/sprint/delete/" + id, { headers: this.headers })
        .subscribe({
          complete: () => {
            if (priority == Priority.HIGH) {
              const index = this.highSprints.findIndex(sprint => sprint.id == id);
              this.highSprints.splice(index, 1);
            } else if (priority == Priority.MIDDLE) {
              const index = this.middleSprints.findIndex(sprint => sprint.id == id);
              this.middleSprints.splice(index, 1);
            } else if (priority == Priority.LOW) {
              const index = this.lowSprints.findIndex(sprint => sprint.id == id);
              this.lowSprints.splice(index, 1);
            }
          }
        });
    }
  }
}
