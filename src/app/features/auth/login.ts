import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/models/models';

@Component({ selector:'app-login', standalone:true, imports:[ReactiveFormsModule], template:`
  <main class="login-page"><div class="login-brand"><div class="brand-mark large">A</div><div><b>AutoAndes</b><small>SISTEMA DE ÓRDENES DE SERVICIO</small></div></div>
    <section class="login-card"><h1>Inicio de sesión</h1>
      @if (error) { <div class="alert error">{{ error }}</div> }
      <form [formGroup]="form" (ngSubmit)="submit()"><label>Usuario<input formControlName="username" autocomplete="off" placeholder="Usuario"></label><label>Contraseña<input type="password" formControlName="password" autocomplete="new-password" placeholder="Contraseña"></label><button class="btn primary full" [disabled]="form.invalid || loading">{{ loading ? 'Ingresando…' : 'Ingresar' }}</button></form>
    </section>
  </main>`})
export class LoginPage {
  private fb=inject(FormBuilder); private auth=inject(AuthService); private route=inject(ActivatedRoute); private router=inject(Router);
  form=this.fb.nonNullable.group({username:['',Validators.required],password:['',Validators.required]}); error=''; loading=false;
  submit():void { if(this.form.invalid||this.loading)return; this.loading=true; this.error=''; this.auth.login(this.form.getRawValue()).subscribe({next:()=>{this.loading=false; const dest=this.route.snapshot.queryParamMap.get('returnUrl')||'/'; void this.router.navigateByUrl(dest.startsWith('/')&&!dest.startsWith('//')?dest:'/');},error:(e:ApiError)=>{this.loading=false;this.error=e.mensaje||'No se pudo iniciar sesión. Verifica el usuario y la contraseña.';}}); }
}
