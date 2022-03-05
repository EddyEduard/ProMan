import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  public createProjectForm = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    description: new FormControl("")
  });

  // Get project name value.
  get createProjectName() {
    return this.createProjectForm.get("name");
  }

  // Get project name value.
  get createProjectDescription() {
    return this.createProjectForm.get("description");
  }

  public editProjectForm = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    description: new FormControl("")
  });

  // Get Project name value.
  get editProjectName() {
    return this.editProjectForm.get("name");
  }

  // Get Project name value.
  get editProjectDescription() {
    return this.editProjectForm.get("description");
  }

  @ViewChild("editProjectModal", { static: true }) private editProjectModal!: ElementRef<HTMLDivElement>;
  @ViewChild("createProjectModal", { static: true }) private createProjectModal!: ElementRef<HTMLDivElement>;

  public projects!: IProject[];
  public project!: IProject;
  public submitted: boolean = false;
  public isValidForm: boolean = false;
  public isSuccessCreateProject: boolean = true;
  public isSuccessEditProject: boolean = true;

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

  // Open edit project.
  openEditProject(project: IProject) {
    this.project = project;
    this.editProjectName?.setValue(project.name);
    this.editProjectDescription?.setValue(project.description);
    this.editProjectModal.nativeElement.style.display = "block";
  }

  // Save created Project.
  async saveCreatedProject() {
    this.submitted = true;

    if (this.createProjectForm.valid) {
      const body = {
        name: this.createProjectName?.value,
        description: this.createProjectDescription?.value
      }

      this.isValidForm = true;

      await this.http.post<IProject>(API_URL + "/project/create", body, { headers: this.headers })
        .pipe(
          map(project => {
            this.projects.push(project);
          })
        ).subscribe(
          {
            complete: () => {
              this.isValidForm = false;
              this.createProjectModal.nativeElement.style.display = "none";
            },
            error: () => {
              this.isValidForm = false;
              this.isSuccessCreateProject = false;
            }
          }
        );
    }
  }

  // Save edited project.
  async saveEditedProject() {
    this.submitted = true;

    if (this.editProjectForm.valid) {
      const body = {
        name: this.editProjectName?.value,
        description: this.editProjectDescription?.value
      }

      await this.http.put<IProject>(API_URL + "/project/update/" + this.project.id, body, { headers: this.headers })
        .pipe(
          map(project => {
            this.project.name = project.name;
            this.project.description = project.description;
          })
        ).subscribe(
          {
            complete: () => {
              this.isValidForm = false;
              this.editProjectModal.nativeElement.style.display = "none";
            },
            error: () => {
              this.isValidForm = false;
              this.isSuccessEditProject = false;
            }
          }
        );
    }
  }

  // Delete a Project.
  async deleteProject(id: number) {
    const isConfirmed = confirm("Are you sure you want to delete this project?");

    if (isConfirmed) {
      await this.http.delete(API_URL + "/project/delete/" + id, { headers: this.headers })
        .subscribe({
          complete: () => {
            const index = this.projects.findIndex(project => project.id == id);
            this.projects.splice(index, 1);
          }
        });
    }
  }
}
