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
import { Vector2 } from 'three';
import { Vector3 } from 'three';
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
import Contour from './floor_plan/Contour';

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

    Debug.draw_axis();
    SceneManager.current.add(new Grid());

    SceneManager.current.add(new AmbientLight());
    SceneManager.current.add(new DirectionalLight());

    this.floor_plan = undefined;

    let points = [];
    points.push(new Vector2(-2, 2));
    points.push(new Vector2(2, 2));
    points.push(new Vector2(2, -2));
    points.push(new Vector2(-2, -2));

    let contour = new Contour("asd", "#FF0000");
    contour.set_from_points(points);

    let point_a = new Vector2(0, 4);
    let point_b = new Vector2(0, -4);

    Debug.draw_sphere(new Vector3(point_a.x, 0, point_a.y), 0.2, "#00FF00");
    Debug.draw_sphere(new Vector3(point_b.x, 0, point_b.y), 0.2, "#00FF00");

    let contours = contour.split(point_a, point_b);

    for(let i=0; i< contours.length; i++)
    {
      contours[i].shrink_away_from_contours(0.2, contours);
      SceneManager.current.add(contours[i].get_extruded_mesh(0.5));
    }

  }

  add_floor_plan(floor_plan)
  {
    this.floor_plan = floor_plan
    SceneManager.current.add(floor_plan);
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
    // this.camera_controller.reference_position.set(-20, 0, -10);
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
