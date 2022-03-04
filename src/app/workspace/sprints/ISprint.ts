import { Priority } from "../Priority.enum";

export interface ISprint {
    id: number;
    company_id: number;
    project_id: number;
    name: string;
    description: string;
    priority: Priority;
    created_date: Date;
    updated_date: Date;
}

