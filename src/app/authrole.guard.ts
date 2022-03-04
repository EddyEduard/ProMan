import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthRoleGuard implements CanActivate {

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const token = sessionStorage.getItem("token");
        const payload: { roles: string } = jwt_decode(token!);
        if (payload.roles !== route.data["expectedRole"]) {
            window.location.href = "/account";
            return false;
        }
        return true;
    }
}