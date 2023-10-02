import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import LayerList from '@arcgis/core/widgets/LayerList.js';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer.js';
import TileLayer from '@arcgis/core/layers/TileLayer.js';
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';
import Slider from '@arcgis/core/widgets/Slider.js';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewRef', { static: true })
  mapViewRef!: ElementRef<HTMLDivElement>;
  map!: any;
  mapView!: any;
  layerList!: any;

  ngOnInit(): void {
    // TileLayer คือมีลำดับข้อมูลอยู่แล้ว สังเกตุจาก Single Fused Map Cache: true ใน Map service
    let mapOceanLayer = new TileLayer({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer',
    });

    let mapCensusLayer = new MapImageLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
    });

    // Create GroupLayer with the two MapImageLayers created above
    // as children layers.
    // const demographicGroupLayer = new GroupLayer({
    //   title: 'Ocean Demographics',
    //   visible: true,
    //   visibilityMode: 'exclusive',
    //   layers: [mapOceanLayer, mapCensusLayer],
    //   opacity: 0.75,
    // });

    this.map = new Map({
      basemap: 'topo-vector',
      // layers: [demographicGroupLayer],
      layers: [mapOceanLayer, mapCensusLayer],
    });

    this.mapView = new MapView({
      center: [-118.31966, 34.13375],
      zoom: 10,
      map: this.map,
      container: this.mapViewRef.nativeElement,
    });

    this.layerList = new LayerList({
      view: this.mapView,
      listItemCreatedFunction: this.defineActions,
    });

    // กำหนดการทำงานของ actions ใน GroupLayer (อันใหญ่ที่ครอบ)
    // this.layerList.on('trigger-action', (event: any) => {
    //   // The layer visible in the view at the time of the trigger.

    //   const visibleLayer = mapOceanLayer.visible
    //     ? mapOceanLayer
    //     : mapCensusLayer;

    //   // Capture the action id.
    //   const id = event.action.id;

    //   if (id === 'full-extent') {
    //     // if the full-extent action is triggered then navigate
    //     // to the full extent of the visible layer
    //     this.mapView.goTo(visibleLayer.fullExtent).catch((error: any) => {
    //       if (error.name != 'AbortError') {
    //         console.error(error);
    //       }
    //     });
    //   } else if (id === 'information') {
    //     // if the information action is triggered, then
    //     // open the item details page of the service layer
    //     window.open(visibleLayer.url);
    //   } else if (id === 'increase-opacity') {
    //     // if the increase-opacity action is triggered, then
    //     // increase the opacity of the GroupLayer by 0.25
    //     if (demographicGroupLayer.opacity < 1) {
    //       demographicGroupLayer.opacity += 0.25;
    //     }
    //   } else if (id === 'decrease-opacity') {
    //     // if the decrease-opacity action is triggered, then
    //     // decrease the opacity of the GroupLayer by 0.25
    //     if (demographicGroupLayer.opacity > 0) {
    //       demographicGroupLayer.opacity -= 0.25;
    //     }
    //   }
    // });

    this.mapView.ui.add(this.layerList, {
      position: 'top-right',
    });

    return this.mapView;
  }

  async defineActions(event: any) {
    // The event object contains an item property.
    // is is a ListItem referencing the associated layer
    // and other properties. You can control the visibility of the
    // item, its title, and actions using this object.
    const item = event.item;

    await item.layer.when();

    // กำหนด action สำหรับ GroupLayer (อันใหญ่ที่ครอบ)
    if (item.title === 'Ocean Demographics') {
      // An array of objects defining actions to place in the LayerList.
      // By making this array two-dimensional, you can separate similar
      // actions into separate groups with a breaking line.
      // item.actionsSections = [
      //   [
      //     {
      //       title: 'Go to full extent',
      //       className: 'esri-icon-zoom-out-fixed',
      //       id: 'full-extent',
      //     },
      //     {
      //       title: 'Layer information',
      //       className: 'esri-icon-description',
      //       id: 'information',
      //     },
      //   ],
      //   [
      //     {
      //       title: 'Increase opacity',
      //       className: 'esri-icon-up',
      //       id: 'increase-opacity',
      //     },
      //     {
      //       title: 'Decrease opacity',
      //       className: 'esri-icon-down',
      //       id: 'decrease-opacity',
      //     },
      //   ],
      // ];
    }

    // Adds a slider for layer (ย่อย)
    const slider = new Slider({
      min: 0,
      max: 1,
      precision: 2,
      values: [1],
      visibleElements: {
        labels: true,
        rangeLabels: true,
      },
    });

    item.panel = {
      content: slider,
      className: 'esri-icon-sliders-horizontal',
      title: 'Change layer opacity',
    };

    slider.on('thumb-drag', (event: any) => {
      const { value } = event;
      item.layer.opacity = value;
    });
  }

  ngOnDestroy(): void {
    if (this.mapView) {
      this.mapView.container = null;
    }
  }
}
