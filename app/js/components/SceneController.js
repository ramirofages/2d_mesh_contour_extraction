import { PerspectiveCamera } from 'ohzi-core';
import { CameraManager } from 'ohzi-core';
import { Grid } from 'ohzi-core';
import { Debug } from 'ohzi-core';
import { SceneManager } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import { Screen } from 'ohzi-core';
import { Graphics } from 'ohzi-core';
import { MeshBatcher } from 'ohzi-core';

import { Color } from 'three';
import { SphereBufferGeometry } from 'three';
import { Shape } from 'three';
import { Vector3 } from 'three';
import { Vector2 } from 'three';
import { PlaneBufferGeometry } from 'three';
import { EdgesGeometry } from 'three';
import { Mesh, MeshBasicMaterial, ExtrudeGeometry } from 'three';
import { AmbientLight } from 'three';
import { DirectionalLight } from 'three';
// import { SpotLight } from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';


import CameraController from '../camera_controller/CameraController';
import FloorPlanGenerator from './floor_plan/FloorPlanGenerator';
import FloorPlan3D from './floor_plan/FloorPlan3D';

class SceneController
{
  init()
  {
    this.camera_controller = new CameraController();
  }

  start()
  {
    this.__init_camera();
    this.__init_camera_controller();

    // Debug.draw_sphere();
    // Debug.draw_axis();
    SceneManager.current.add(new Grid());

    SceneManager.current.add(new AmbientLight());
    SceneManager.current.add(new DirectionalLight());

    // let floor_plan_generator = new FloorPlanGenerator();

    // let floor_plan_scene = ResourceContainer.get('plan').scene

    // let floor_plan = floor_plan_generator.build_from_scene(floor_plan_scene);
    // SceneManager.current.add(floor_plan);

    // this.floor_plan = floor_plan;
  }

  add_floor_plan(floor_plan)
  {
    SceneManager.current.add(floor_plan);
  }

  intersects_line (p1a, p1b, p2a, p2b) {
    const o1 = new Vector2(p1a.x, p1a.z);
    const o2 = new Vector2(p2a.x, p2a.z);
    const d1 = o1.clone().sub(new Vector2(p1b.x, p1b.z));
    const d2 = o2.clone().sub(new Vector2(p2b.x, p2b.z));

    const det = (d1.x * d2.y - d2.x * d1.y)
    if ( Math.abs(det) < 1e-12 ) {
      return undefined
    }
    const d20o11 = d2.x * o1.y
    const d21o10 = d2.y * o1.x
    const d20o21 = d2.x * o2.y
    const d21o20 = d2.y * o2.x
    const t = (((d20o11 - d21o10) - d20o21) + d21o20)/ det;
    let result = o1.add(d1.multiplyScalar(t)); //(d1 * t) + 
    return new Vector2(result.x, result.y);
  }


  update()
  {
    this.camera_controller.update();
  }

  __init_camera()
  {
    let camera = new PerspectiveCamera(60, Screen.aspect_ratio, 0.1, 200);
    camera.updateProjectionMatrix();
    camera.position.z = 10;

    camera.clear_color.copy(new Color('#181818'));
    camera.clear_alpha = 1;
    CameraManager.current = camera;
  }

  __init_camera_controller()
  {
    this.camera_controller.set_camera(CameraManager.current);
    // this.camera_controller.set_idle();
    this.camera_controller.set_standard_mode();

    this.camera_controller.min_zoom = 1;
    this.camera_controller.max_zoom = 100;
    this.camera_controller.reference_zoom = 5;
    // this.camera_controller.reference_position.set(-30, 0, -10);
    this.camera_controller.set_rotation(10, 0);
  }

  export_scene(callback)
  {
    const exporter = new GLTFExporter();
    
    let export_options = {
      onlyVisible : false
    }

    exporter.parse(this.floor_plan, function ( gltf ) {
        callback(JSON.stringify(gltf));

      // new GLTFLoader().parse(JSON.stringify(gltf), '', (result)=>{
      //   callback(result);
      // })
    }, export_options);
  }
}

export default new SceneController();
