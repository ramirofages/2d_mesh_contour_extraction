import { FloorPlanViewer } from './js/FloorPlanViewer';

let floor_plan_viewer = new FloorPlanViewer();
floor_plan_viewer.init();



    // this.export_scene( (result => { 
    //   console.log(result)
    //   let blob = new Blob( [ result ], { type: 'text/plain' } );


    //   this.link.href = URL.createObjectURL( blob );
    //   this.link.download = 'test.gltf';
    //   this.link.click();


    // }).bind(this));
