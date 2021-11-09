import { FloorPlanViewer } from './js/FloorPlanViewer';
import DatGui from './js/components/DatGui';

let floor_plan_viewer = new FloorPlanViewer();
floor_plan_viewer.init();


// floor_plan_viewer.load_floor_plan_gltf("plan 1", 'plan.glb').then(()=>{
// // floor_plan_viewer.load_floor_plan_gltf("plan 1", 'plan_simple.glb').then(()=>{
//   console.log("DONE LOADING");
// })


DatGui.settings.export_gltf = ()=>{
  
  let link = document.createElement( 'a' );
  link.style.display = 'none';
  document.body.appendChild( link ); 

  floor_plan_viewer.export_scene( 
    gltf_json_scene => { 
      let blob = new Blob( [ gltf_json_scene ], { type: 'text/plain' } );


      link.href = URL.createObjectURL( blob );
      link.download = 'test.gltf';
      link.click();
    }
  );
};

