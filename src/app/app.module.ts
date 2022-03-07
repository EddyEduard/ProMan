import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AccountComponent } from './workspace/account/account.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ProjectsComponent } from './workspace/projects/projects.component';
import { SprintsComponent } from './workspace/sprints/sprints.component';
import { TasksComponent } from './workspace/tasks/tasks.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    WorkspaceComponent,
    AccountComponent,
    ProjectsComponent,
    SprintsComponent,
    TasksComponent,
    WelcomeComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
