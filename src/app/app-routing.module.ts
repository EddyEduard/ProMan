import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AccountComponent } from './workspace/account/account.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ProjectsComponent } from './workspace/projects/projects.component';
import { SprintsComponent } from './workspace/sprints/sprints.component';
import { TasksComponent } from './workspace/tasks/tasks.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';

const routes: Routes = [
  { path: "", component: WelcomeComponent },
  {
    path: "auth", component: AuthComponent, children: [
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent }
    ]
  },
  {
    path: "workspace", component: WorkspaceComponent, children: [
      { path: "account", component: AccountComponent, canActivate: [AuthGuard] },
      { path: "projects", component: ProjectsComponent, canActivate: [AuthGuard] },
      { path: "sprints/:project_id", component: SprintsComponent, canActivate: [AuthGuard] },
      { path: "tasks/:project_id/:sprint_id", component: TasksComponent, canActivate: [AuthGuard] }
    ]
  },
  { path: "pagenotfound", component: PageNotFoundComponent },
  { path: "**", pathMatch: "full", redirectTo: "/pagenotfound" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
