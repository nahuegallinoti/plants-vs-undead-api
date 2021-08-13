import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlantsService } from './Services/plants-service';
import { delay, map, takeUntil } from 'rxjs/operators';
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

  searchForm: FormGroup;

  crowPlants: any[] = [];
  plantasMenosRegadas: any[] = [];
  addressGlobal: any[] = [];

  searchPlants: boolean = false;
  addressCargadas: boolean = false;
  addressesFromFile: any[] = [];

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

  // getPlantsWithCrow() {
  //   for (let i = 0; i < this.plants.length; i++) {
  //     let plantaActual = this.plants[i];

  //     if (plantaActual.hasCrow) {
  //       let planta = {
  //         idPlanta: plantaActual.plantId,
  //         hasCrow: plantaActual.hasCrow,
  //         pagina: this.paginaActual,
  //         coordenada: plantaActual.land.x + '/' + plantaActual.land.y,
  //       };
  //       this.crowPlants.push(planta);
  //     }
  //   }
  // }

  getPlantsMenosRegadas(plants: Datum[], paginaActual: number) {

    for (let i = 0; i < plants.length; i++) {
      let plantaActual = plants[i];

      let planta = {
        idPlanta: plantaActual.plantId,
        riegos: this.getCantidadRiegos(plantaActual.activeTools),
        pagina: paginaActual,
        address: plantaActual.ownerId,
        // coordenada: plantaActual.land.x + '/' + plantaActual.land.y,
        horaReseteo: this.getFechaReseteo(plantaActual.activeTools),
        hasCrow: plantaActual.hasCrow ? "SI" : "NO"
      };

      this.plantasMenosRegadas.push(planta);
      this.plantasMenosRegadas.sort((a, b) => a.riegos - b.riegos);

    }
  }

  getFechaReseteo(tools: any[]): any {
    for (let j = 0; j < tools.length; j++) {
      let toolActual = tools[j];

      if (toolActual.type != 'WATER') continue;

      return toolActual.startTime;
    }
  }

  getCantidadRiegos(tools: any[]): any {
    for (let j = 0; j < tools.length; j++) {
      let toolActual = tools[j];

      if (toolActual.type != 'WATER') continue;

      return toolActual.count;
    }
  }

  limpiar() {
    this.crowPlants = [];
    this.plantasMenosRegadas = [];
  }

  generateAddressByLand() {
    for (
      let x = this.searchForm.value.xDesde;
      x <= this.searchForm.value.xHasta;
      x++
    ) {
      for (
        let y = this.searchForm.value.yDesde;
        y <= this.searchForm.value.yHasta;
        y++
      ) {
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

  plantsByAddress() {
    let intervalId = setInterval(() => {
      this.searchPlantsByAdress(this.addressesFromFile[0]);
      this.addressesFromFile.shift();

      if (this.addressesFromFile.length == 0) {
        clearInterval(intervalId);
        alert('Busqueda terminada');
      }
    }, 15000);
  }

  loadAdressFromFile() {
    this.readAdressFromFile().subscribe((resultado: string) => {
      let arr = resultado.split(',');
      arr.forEach((x) => this.addressesFromFile.push(x));
      this.addressCargadas = true;
      alert('Adressess cargadas');
    });
  }

  readAdressFromFile(): Observable<any> {
    return this.http.get('assets/adressByLand.txt', {
      responseType: 'text' as 'json',
    });
  }

  searchPlantsByAdress(address: string) {
    let limit = 10;
    let offset = 0;
    let paginaActual = 1;
    let totalPages = 0;
    let intervalId: any;

    intervalId = setInterval(() => {
      this._plantsService
        .getPlantsByAddress(
          limit.toString(),
          offset.toString(),
          address,
          this.searchForm.value.token
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result) => {
          this.getPlantsMenosRegadas(result.data, paginaActual);

          //revisar
          totalPages = Math.round(result.total / limit);
          if (paginaActual > totalPages) {
            clearInterval(intervalId);
          }
          offset += 10;
          paginaActual += 1;
        });
    }, 3000);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
