import { PerspectiveCamera } from 'ohzi-core';
import { CameraManager } from 'ohzi-core';
import { Grid } from 'ohzi-core';
import { Debug } from 'ohzi-core';
import { SceneManager } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import { Screen } from 'ohzi-core';
import { Graphics } from 'ohzi-core';

import { Color } from 'three';
import { Shape } from 'three';
import { Vector3 } from 'three';
import { Vector2 } from 'three';
import { PlaneBufferGeometry } from 'three';
import { EdgesGeometry } from 'three';
import { Mesh, MeshBasicMaterial, ExtrudeGeometry } from 'three';
import { AmbientLight } from 'three';
import { DirectionalLight } from 'three';
// import { SpotLight } from 'three';

import CameraController from '../camera_controller/CameraController';
import MeshContour from './MeshContour';

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
    Debug.draw_axis();
    SceneManager.current.add(new Grid());

    SceneManager.current.add(new AmbientLight());
    SceneManager.current.add(new DirectionalLight());

    // SceneManager.current.add(ResourceContainer.get('plan').scene);
    // let custom_plane = ResourceContainer.get('plane').scene.getObjectByName('pPlane1')
    // let geo = custom_plane.geometry;
    // geo.scale(1000,1000,1000);

    let floor_plan = ResourceContainer.get('plan').scene

    let units = floor_plan.getObjectByName('Units001')
    for(let i=0; i< units.children.length; i++)
    {
      let child = units.children[i];
      if(child.geometry)
      {
        let mesh_contour = new MeshContour(child);
        let extruded_mesh = mesh_contour.get_extruded_mesh(0.1, 0.2);
        SceneManager.current.add(extruded_mesh);
        // extruded_mesh.position.y = i*0.1;
      }
    }

    let slabs = floor_plan.getObjectByName('FloorSlabs');
    for(let i=0; i< slabs.children.length; i++)
    {
      let child = slabs.children[i];
      if(child.geometry)
      {
        let mesh_contour = new MeshContour(child);
        // mesh_contour.show_contour()
        let extruded_mesh = mesh_contour.get_extruded_mesh(0.1);
        SceneManager.current.add(extruded_mesh);
      }
    }


    // let mesh_contour = new MeshContour(custom_plane);
    // mesh_contour.show_contour()
    // let extruded_mesh = mesh_contour.get_extruded_mesh(1);
    // extruded_mesh.position.y = -1;
    // SceneManager.current.add(extruded_mesh);


    // let center = new Vector2();

    // let dir= new Vector2(10,10);

    // let intersection = mesh_contour.intersects_line(center, dir);
    // if(intersection)
    // {
    //   Debug.draw_line([center, new Vector3(intersection.x, 0, intersection.y)])
    // }
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
    this.camera_controller.max_zoom = 40;
    this.camera_controller.reference_zoom = 40;
    // this.camera_controller.reference_position.set(-30, 0, -10);
    this.camera_controller.set_rotation(90, 0);
  }
}

export default new SceneController();
