import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PlantsService } from './Services/plants-service';
import { takeUntil } from 'rxjs/operators';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { Datum } from './Models/Plant';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  intervalId: any;
  searchForm: FormGroup;
  offset: number = 0;
  limit: number = 10;
  plants: Datum[] = [];
  total: number = 0;
  pages: number = 0;
  paginaActual: number = 0;
  crowPlants: Datum[] = [];
  plantasMenosRegadas: any[] = [];
  searchPlants: boolean = false;

  constructor(
    private _plantsService: PlantsService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      address: new FormControl('', [Validators.required]),
      token: new FormControl('', [Validators.required]),
    });
  }

  avanzarPagina() {
    this.paginaActual += 1;
    this.offset += 10;
    this.searchManual();
  }
  
  searchManual() {
    this.searchPlants = true;

    this._plantsService
      .getPlantsByAddress(
        this.limit.toString(),
        this.offset.toString(),
        this.searchForm.value.address,
        this.searchForm.value.token
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          this.plants = result.data;
          this.total = result.total;
          this.pages = Math.trunc(this.total / this.limit) + 1;
          this.searchPlants = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  updateOffset = () => {
    this.offset += 10;
  };

  updatePage = () => {
    this.paginaActual += 1;
  };

  searchAutomatico() {
    let contador = 1;
    this.searchPlants = true;
    
    this.intervalId = setInterval(() => {
      this._plantsService
        .getPlantsByAddress(
          this.limit.toString(),
          this.offset.toString(),
          this.searchForm.value.address,
          this.searchForm.value.token
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (result) => {
            this.plants = result.data;
            this.total = result.total;
            this.pages = Math.trunc(this.total / this.limit) + 1;

            this.getPlantsWithCrow();
            this.getPlantsMenosRegadas();

            if (contador == this.pages) {
              this.offset = 0;
              this.paginaActual = 0;
              this.searchPlants = false;
              clearInterval(this.intervalId);
            } else {
              contador += 1;
              this.updateOffset();
              this.updatePage();
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }, 2000);
  }

  getPlantsWithCrow() {
    for (let i = 0; i < this.plants.length; i++) {
      let plantaActual = this.plants[i];
      plantaActual.hasCrow ? this.crowPlants.push(plantaActual) : '';
    }
  }

  getPlantsMenosRegadas() {
    let plantId = 0;
    let menor = 999;

    for (let i = 0; i < this.plants.length; i++) {
      let plantaActual = this.plants[i];
      let cantidadRiegos = this.getCantidadRiegos(plantaActual.activeTools);

      if (cantidadRiegos <= menor) {
        plantId = plantaActual.plantId;
        menor = cantidadRiegos;
      }
    }

    let plantaMenosRegada = this.plants.find((p) => p.plantId == plantId);

    let planta = {
      idPlanta: plantaMenosRegada.plantId,
      riegos: menor,
    };

    this.plantasMenosRegadas.push(planta);
  }

  getCantidadRiegos(tools: any[]): any {
    for (let j = 0; j < tools.length; j++) {
      let toolActual = tools[j];

      if (toolActual.type != 'WATER') continue;

      return toolActual.count;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
