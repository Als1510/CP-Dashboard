import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {

  loading

  constructor(private _loaderService: LoaderService) {
    this._loaderService.isLoading.subscribe((v) => {
      this.loading = v
    })
  }

  ngOnInit() {}

}
