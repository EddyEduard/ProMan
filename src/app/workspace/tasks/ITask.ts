import { Priority } from "../Priority.enum";
import { Status } from "../Status.enum";

export interface ITask {
    id: number;
    company_id: number;
    project_id: number;
    sprint_id: number;
    name: string;
    description: string;
    priority: Priority;
    status: Status;
    created_date: Date;
    updated_date: Date;
    created_date_format?: string;
    updated_date_format?: string;
}
