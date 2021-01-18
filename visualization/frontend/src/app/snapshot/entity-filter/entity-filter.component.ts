import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { entityFilter } from '../distribution/distribution.entity';

@Component({
  selector: 'app-entity-filter',
  templateUrl: './entity-filter.component.html',
  styleUrls: ['./entity-filter.component.scss']
})
export class EntityFilterComponent implements OnInit {

  @Input()
  public filter: entityFilter = 'class';
  @Output()
  public changeFilter: EventEmitter<entityFilter> = new EventEmitter();

  public availableFilters: entityFilter[] = ['file', 'class', 'method']


  constructor() { }

  ngOnInit() {
  }
}
