import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PlantsService } from './Services/plants-service';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { Datum } from './Models/Plant';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  searchForm: FormGroup;
  offset: number = 0;
  limit: number = 10;
  plants: Datum[] = [];
  total: number = 0;
  pages: number = 0;
  paginaActual: number = 1;
  crowPlants: Datum[] = [];

  constructor(
    private _plantsService: PlantsService,
    private formBuilder: FormBuilder

  ) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      address: new FormControl('', [Validators.required]),
      token: new FormControl('', [Validators.required])
    });
  }


  avanzarPagina() {
    this.paginaActual += 1;
    this.offset += 10;
    this.search();
  }

  search() {
    this._plantsService.getPlantsByAddress(this.limit.toString(), this.offset.toString(), this.searchForm.value.address, this.searchForm.value.token).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (result) => {
        this.plants = result.data;
        this.total = result.total;
        this.pages = Math.trunc(this.total / this.limit) + 1;
      },
      (error) => { console.log(error); }
    );
  }
  
  updateOffset = () => {
    this.offset += 10;
  }

  updatePage = () => {
    this.paginaActual +=1;
  }

  searchCrows() {
    setInterval(() => {    
      this._plantsService.getPlantsByAddress(this.limit.toString(), this.offset.toString(), this.searchForm.value.address, this.searchForm.value.token).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (result) => {
          this.plants = result.data;
          this.total = result.total;
          this.pages = Math.trunc(this.total / this.limit) + 1;

          for (let i = 0; i < this.plants.length; i++) {
            this.plants[i].hasCrow ? this.crowPlants.push(this.plants[i]) : "";
          }

          this.updateOffset();
          this.updatePage();
        },
        (error) => { console.log(error); }
      );
    }, 3000);

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}