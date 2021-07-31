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
import EdgeLoop from './EdgeLoop';

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


    let floor_plan = ResourceContainer.get('plan').scene

    let neighboor_loops = [];
    let neighboor_meshes = [];
    let units = floor_plan.getObjectByName('Units001')
    for(let i=0; i< units.children.length; i++)
    {
      let child = units.children[i];
      if(child.geometry)
      {
        let mesh_contour = new MeshContour(child);
        neighboor_meshes.push(mesh_contour);
        neighboor_loops.push(mesh_contour.edge_groups[0]);
        // let extruded_mesh = mesh_contour.get_extruded_mesh(1, 0.2);
        // SceneManager.current.add(extruded_mesh);
        // extruded_mesh.position.y = i*0.1;
      }
    }

    for(let i=0; i< neighboor_meshes.length; i++)
    {
      let extruded_mesh = neighboor_meshes[i].get_extruded_mesh(1, 0.2, neighboor_loops);
      SceneManager.current.add(extruded_mesh);
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

    // let edges0 = [];
    // edges0.push({
    //   from: new Vector2(0,0),
    //   to: new Vector2(1,0)
    // })
    // edges0.push({
    //   from: new Vector2(1,0),
    //   to: new Vector2(1,1)
    // })
    // edges0.push({
    //   from: new Vector2(1,1),
    //   to: new Vector2(0,1)
    // })
    // edges0.push({
    //   from: new Vector2(0,1),
    //   to: new Vector2(0,0)
    // })

    // let edges1 = [];
    // edges1.push({
    //   from: new Vector2(1,0),
    //   to: new Vector2(2,0)
    // })
    // edges1.push({
    //   from: new Vector2(2,0),
    //   to: new Vector2(2,1)
    // })
    // edges1.push({
    //   from: new Vector2(2,1),
    //   to: new Vector2(1,1)
    // })
    // edges1.push({
    //   from: new Vector2(1,1),
    //   to: new Vector2(1,0)
    // })

    // let edge_loop0 = new EdgeLoop(edges0);
    // let edge_loop1 = new EdgeLoop(edges1);


    // edge_loop0.shrink(0.1, [edge_loop0, edge_loop1])
    // edge_loop0.draw()

    // edge_loop1.shrink(0.1, [edge_loop0, edge_loop1])
    // edge_loop1.draw()


    // let edge0 = [new Vector3(0,0,0), new Vector3(1,0,0)]
    // let edge1 = [new Vector3(1,0,0), new Vector3(1,0,1)]
    // let edge2 = [new Vector3(1,0,1), new Vector3(0,0,0)]

    

    // Debug.draw_line(edge0, "#FF0000")
    // Debug.draw_line(edge1, "#FF0000")
    // Debug.draw_line(edge2, "#FF0000")

    // //displace

    // let n0 = edge0[1].clone().sub(edge0[0]).normalize().multiplyScalar(0.1);
    // n0.set(-n0.z, 0, n0.x);
    // let n1 = edge1[1].clone().sub(edge1[0]).normalize().multiplyScalar(0.1);
    // n1.set(-n1.z, 0, n1.x);
    // let n2 = edge2[1].clone().sub(edge2[0]).normalize().multiplyScalar(0.1);
    // n2.set(-n2.z, 0, n2.x);

    // edge0[0].add(n0);
    // edge0[1].add(n0);

    // edge1[0].add(n1);
    // edge1[1].add(n1);

    // edge2[0].add(n2);
    // edge2[1].add(n2);

    // // Debug.draw_line(edge0, "#00AF00");
    // // Debug.draw_line(edge1, "#00AF00");
    // // Debug.draw_line(edge2, "#00AF00");

    // let result = this.intersects_line(edge0[0], edge0[1], edge1[0], edge1[1]);
    // if(result)
    // {
    //   edge0[1].set(result.x, 0, result.y);
    //   edge1[0].set(result.x, 0, result.y);
    // }

    // result = this.intersects_line(edge1[0], edge1[1], edge2[0], edge2[1]);
    // if(result)
    // {
    //   edge1[1].set(result.x, 0, result.y);
    //   edge2[0].set(result.x, 0, result.y);
    // }

    // result = this.intersects_line(edge2[0], edge2[1], edge0[0], edge0[1]);
    // if(result)
    // {
    //   edge2[1].set(result.x, 0, result.y);
    //   edge0[0].set(result.x, 0, result.y);
    // }

    // edge0[0].y = 0.01;
    // edge0[1].y = 0.01;

    // edge1[0].y = 0.01;
    // edge1[1].y = 0.01;

    // edge2[0].y = 0.01;
    // edge2[1].y = 0.01;
    // Debug.draw_line(edge0, "#F0FFFF");
    // Debug.draw_line(edge1, "#F0FFFF");
    // Debug.draw_line(edge2, "#F0FFFF");

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
    this.camera_controller.reference_zoom = 70;
    // this.camera_controller.reference_position.set(-30, 0, -10);
    this.camera_controller.set_rotation(90, 0);
  }
}

export default new SceneController();
