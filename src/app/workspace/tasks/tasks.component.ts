import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Priority } from '../Priority.enum';
import { Status } from '../Status.enum';
import { ITask } from './ITask';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  public createTaskForm = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    description: new FormControl(""),
    priority: new FormControl("", Validators.compose([Validators.required]))
  });

  // Get task name value.
  get createTaskName() {
    return this.createTaskForm.get("name");
  }

  // Get task name value.
  get createTaskDescription() {
    return this.createTaskForm.get("description");
  }

  // Get task priority value.
  get createTaskPriority() {
    return this.createTaskForm.get("priority");
  }

  public editTaskForm = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required, Validators.minLength(6)])),
    description: new FormControl(""),
    priority: new FormControl("", Validators.compose([Validators.required]))
  });

  // Get task name value.
  get editTaskName() {
    return this.editTaskForm.get("name");
  }

  // Get task name value.
  get editTaskDescription() {
    return this.editTaskForm.get("description");
  }

  // Get task priority value.
  get editTaskPriority() {
    return this.editTaskForm.get("priority");
  }

  @ViewChild("openTaskModal", { static: true }) private openTaskModal!: ElementRef<HTMLDivElement>;
  @ViewChild("createTaskModal", { static: true }) private createTaskModal!: ElementRef<HTMLDivElement>;

  public toDoTasks!: ITask[];
  public inProgressTasks!: ITask[];
  public doneTasks!: ITask[];
  public openedTask!: ITask;
  public openedTaskIndex: number = -1;
  public isEditTask: boolean = false;
  public submitted: boolean = false;
  public isValidForm: boolean = false;
  public isSuccessCreateTask: boolean = true;
  public isSuccessEditTask: boolean = true;

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
        const sprint_id = value["sprint_id"];

        await this.http.get<ITask[]>(API_URL + "/task/get/" + project_id + "/" + sprint_id, { headers: this.headers })
          .pipe(
            map(tasks => {
              this.toDoTasks = tasks.filter(task => task.status == Status.TODO);
              this.inProgressTasks = tasks.filter(task => task.status == Status.INPROGRESS);
              this.doneTasks = tasks.filter(task => task.status == Status.DONE);
            })
          ).subscribe();
      })
    ).subscribe();
  }

  // Create a task.
  createTask() {
    this.createTaskModal.nativeElement.style.display = "block";
  }

  // Save created task.
  async saveCreatedTask() {
    this.submitted = true;

    if (this.createTaskForm.valid) {
      await this.activatedRouter.params.pipe(
        map(async value => {
          const project_id = value["project_id"];
          const sprint_id = value["sprint_id"];
          const body = {
            projectId: project_id,
            sprintId: sprint_id,
            name: this.createTaskName?.value,
            description: this.createTaskDescription?.value,
            priority: this.createTaskPriority?.value
          }

          this.isValidForm = true;

          await this.http.post<ITask>(API_URL + "/task/create", body, { headers: this.headers })
            .pipe(
              map(task => {
                this.toDoTasks.push(task);
              })
            ).subscribe(
              {
                complete: () => {
                  this.isValidForm = false;
                  this.createTaskModal.nativeElement.style.display = "none";
                },
                error: () => {
                  this.isValidForm = false;
                  this.isSuccessCreateTask = false;
                }
              }
            );
        })
      ).subscribe();
    }
  }

  // Open a task.
  openTask(index: number, status: string) {
    if (status == Status.TODO)
      this.openedTask = this.toDoTasks[index];
    else if (status == Status.INPROGRESS)
      this.openedTask = this.inProgressTasks[index];
    else if (status == Status.DONE)
      this.openedTask = this.doneTasks[index];

    this.openedTaskIndex = index;

    this.openedTask.created_date_format = this.openedTask.created_date.toString().split("T")[0];
    this.openedTask.updated_date_format = this.openedTask.updated_date.toString().split("T")[0];

    this.openTaskModal.nativeElement.style.display = "block";
  }

  // Edit a task.
  editTask() {
    this.isEditTask = true;
    this.editTaskName?.setValue(this.openedTask.name);
    this.editTaskDescription?.setValue(this.openedTask.description);
    this.editTaskPriority?.setValue(this.openedTask.priority);
  }

  // Save edit task.
  async saveEditTask() {
    this.submitted = true;

    if (this.editTaskForm.valid) {
      this.openedTask.name = this.editTaskName?.value;
      this.openedTask.description = this.editTaskDescription?.value;
      this.openedTask.priority = this.editTaskPriority?.value;

      this.isValidForm = true;

      await this.http.put<ITask>(API_URL + "/task/update/" + this.openedTask.id, this.openedTask, { headers: this.headers })
        .subscribe({
          complete: () => {
            this.isValidForm = false;
            this.isEditTask = false;
          },
          error: () => {
            this.isValidForm = false;
            this.isSuccessEditTask = false;
          }
        });
    }
  }

  // Switch a task to status 'TODO'.
  async switchToToDo() {
    const oldStatus = this.openedTask.status;
    this.openedTask.status = Status.TODO;
    this.toDoTasks.push(this.openedTask);

    if (oldStatus == Status.INPROGRESS)
      this.inProgressTasks.splice(this.openedTaskIndex, 1);
    else if (oldStatus == Status.DONE)
      this.doneTasks.splice(this.openedTaskIndex, 1);

    await this.saveStatusTask();
  }

  // Switch a task to status 'INPROGRESS'.
  async switchToInProgress() {
    const oldStatus = this.openedTask.status;
    this.openedTask.status = Status.INPROGRESS;
    this.inProgressTasks.push(this.openedTask);

    if (oldStatus == Status.TODO)
      this.toDoTasks.splice(this.openedTaskIndex, 1);
    else if (oldStatus == Status.DONE)
      this.doneTasks.splice(this.openedTaskIndex, 1);

    await this.saveStatusTask();
  }

  // Switch a task to status 'DONE'.
  async switchToDone() {
    const oldStatus = this.openedTask.status;
    this.openedTask.status = Status.DONE;
    this.doneTasks.push(this.openedTask);


    if (oldStatus == Status.TODO)
      this.toDoTasks.splice(this.openedTaskIndex, 1);
    else if (oldStatus == Status.INPROGRESS)
      this.inProgressTasks.splice(this.openedTaskIndex, 1);

    await this.saveStatusTask();
  }

  // Save editied task.
  async saveStatusTask() {
    await this.http.put(API_URL + "/task/update/" + this.openedTask.id, this.openedTask, { headers: this.headers }).subscribe();
  }

  // Delete a task.
  async deleteTask() {
    const isConfirmed = confirm("Are you sure you want to delete this task?");

    if (isConfirmed) {
      await this.http.delete(API_URL + "/task/delete/" + this.openedTask.id, { headers: this.headers })
        .subscribe({
          complete: () => {
            if (this.openedTask.status == Status.TODO)
              this.toDoTasks.splice(this.openedTaskIndex, 1);
            else if (this.openedTask.status == Status.INPROGRESS)
              this.inProgressTasks.splice(this.openedTaskIndex, 1);
            if (this.openedTask.status == Status.DONE)
              this.doneTasks.splice(this.openedTaskIndex, 1);
            this.openTaskModal.nativeElement.style.display = "none";
          }
        });
    }
  }
}
