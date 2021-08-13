import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PlantsService } from './Services/plants-service';
import { delay, takeUntil } from 'rxjs/operators';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  SelectMultipleControlValueAccessor,
  Validators,
} from '@angular/forms';
import { Datum } from './Models/Plant';
import { LandService } from './Services/land.service';
import { HttpClient } from '@angular/common/http';

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
  paginaActual: number = 1;
  crowPlants: any[] = [];
  plantasMenosRegadas: any[] = [];
  searchPlants: boolean = false;
  addressGlobal: any[] = [];

  constructor(
    private _plantsService: PlantsService,
    private _landService: LandService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      address: new FormControl('', [Validators.required]),
      token: new FormControl('', [Validators.required]),
      xDesde: new FormControl('', [Validators.required]),
      xHasta: new FormControl('', [Validators.required]),
      yDesde: new FormControl('', [Validators.required]),
      yHasta: new FormControl('', [Validators.required]),

    });
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

            if (this.plants.length > 0) {
              this.getPlantsWithCrow();
              this.getPlantsMenosRegadas(this.plants);

              if (contador == this.pages) {
                this.offset = 0;
                this.paginaActual = 1;
                this.searchPlants = false;
                clearInterval(this.intervalId);
              } else {
                contador += 1;
                this.updateOffset();
                this.updatePage();
              }
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
      
      if (plantaActual.hasCrow) {

        let planta = {
          idPlanta: plantaActual.plantId,
          hasCrow: plantaActual.hasCrow,
          pagina: this.paginaActual,
          coordenada: plantaActual.land.x + '/' + plantaActual.land.y
        };
          this.crowPlants.push(planta);
    }
    }
  }

  getPlantsMenosRegadas(plants: Datum[]) {
    let plantId = 0;
    let menor = 999;

    for (let i = 0; i < plants.length; i++) {
      let plantaActual = plants[i];
      let cantidadRiegos = this.getCantidadRiegos(plantaActual.activeTools);

      if (cantidadRiegos <= menor) {
        plantId = plantaActual.plantId;
        menor = cantidadRiegos;
      }
    }

    let plantaMenosRegada = plants.find((p) => p.plantId == plantId);

    let planta = {
      idPlanta: plantaMenosRegada.plantId,
      riegos: menor,
      pagina: this.paginaActual,
      address: plantaMenosRegada.ownerId,
      coordenada: plantaMenosRegada.land.x + '/' + plantaMenosRegada.land.y
    };

    this.plantasMenosRegadas.push(planta);
    this.plantasMenosRegadas.sort((a, b) => a.riegos - b.riegos);
  }

  getCantidadRiegos(tools: any[]): any {
    for (let j = 0; j < tools.length; j++) {
      let toolActual = tools[j];

      if (toolActual.type != 'WATER') continue;

      return toolActual.count;
    }
  }

  limpiar() {
    this.offset = 0;
    this.paginaActual = 1;
    this.plants = [];
    this.total = 0;
    this.pages = 0;
    this.crowPlants = [];
    this.plantasMenosRegadas = [];
  }

  generateAddressByLand() {
    //falta un set interval o algo de eso
    for (let x = this.searchForm.value.xDesde; x <= this.searchForm.value.xHasta; x++) {
      for (let y = this.searchForm.value.yDesde; y <= this.searchForm.value.yHasta; y++) {
        this._landService
          .getAddressByCoordenada(
            x.toString(),
            y.toString(),
            this.searchForm.value.token
          )
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (result) => {
              result.data.ownerId != ''
                ? this.addressGlobal.push(result.data.ownerId + ',')
                : '';
            },
            (error) => {
              console.log(error);
            }
          );

      }
    }
  }

  plantsMenosRegadasByLand() {
    this.http
      .get('assets/adressByLand.txt', { responseType: 'text' as 'json' })
      .subscribe((data: string) => {
        let adresses = data.split(',');

        adresses.forEach((address) => {
          this.searchPlantsByAdress(address);
        });
      });
  }

  searchPlantsByAdress(address: string) {
    let contador = 1;

    this.searchPlants = true;

    this.intervalId = setInterval(() => {
      this._plantsService
        .getPlantsByAddress(
          this.limit.toString(),
          this.offset.toString(),
          address,
          this.searchForm.value.token
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (result) => {
            result.data.forEach(plant => {
              this.plants.push(plant);
            });
            
            // this.plants = result.data;
            this.total = result.total;
            this.pages = Math.trunc(this.total / this.limit) + 1;

            if (this.plants.length > 0) {
              this.getPlantsWithCrow();
              this.getPlantsMenosRegadas(this.plants);

              if (contador == this.pages) {
                this.offset = 0;
                this.paginaActual = 1;
                this.searchPlants = false;
                clearInterval(this.intervalId);
              } else {
                contador += 1;
                this.updateOffset();
                this.updatePage();
              }
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }, 2000);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
